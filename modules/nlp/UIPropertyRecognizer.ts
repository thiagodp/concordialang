
import { DateTimeFormatter, LocalDate } from '@js-joda/core';
import { ContentNode, EntityValue, UIProperty, EntityValueType } from '../ast';
import { UIPropertyTypes } from '../ast/UIPropertyTypes';
import { LocatedException } from '../error/LocatedException';
import { Entities, NLPResult } from '../nlp';
import { isDefined } from '../util/TypeChecking';
import { adjustValueToTheRightType, ValueType } from '../util/ValueTypeDetector';
import { Intents } from './Intents';
import { NLP } from './NLP';
import { NLPException } from './NLPException';
import { NLPTrainer } from './NLPTrainer';
import { NLPResultProcessor, NodeSentenceRecognizer } from './NodeSentenceRecognizer';
import { RuleBuilder } from './RuleBuilder';
import { DEFAULT_UI_PROPERTY_SYNTAX_RULE, UI_PROPERTY_SYNTAX_RULES } from './SyntaxRules';
import { UIElementPropertyExtractor } from '../util/UIElementPropertyExtractor';

/**
 * UI element property sentence recognizer.
 *
 * @author Thiago Delgado Pinto
 */
export class UIPropertyRecognizer {

    private _syntaxRules: any[];

    constructor( private _nlp: NLP ) {
        this._syntaxRules = this.buildSyntaxRules();
    }

    nlp(): NLP {
        return this._nlp;
    }

    isTrained( language: string ): boolean {
        return this._nlp.isTrained( language );
    }

    trainMe( trainer: NLPTrainer, language: string ) {
        return trainer.trainNLP( this._nlp, language, Intents.UI );
            // && trainer.trainNLP( this._nlp, language, Intents.UI_ITEM_QUERY );
    }

    /**
     * Recognize sentences of UI Elements using NLP.
     *
     * @param language Language to be used in the recognition.
     * @param nodes Nodes to be recognized.
     * @param errors Output errors.
     * @param warnings Output warnings.
     *
     * @throws Error If the NLP is not trained.
     */
    recognizeSentences(
        language: string,
        nodes: UIProperty[],
        errors: LocatedException[],
        warnings: LocatedException[]
    ) {
        const recognizer = new NodeSentenceRecognizer( this._nlp );
        const syntaxRules = this._syntaxRules;

        const _this = this;

        let processor: NLPResultProcessor = function(
            node: ContentNode,
            r: NLPResult,
            errors: LocatedException[],
            warnings: LocatedException[]
        ): ContentNode {

            const recognizedEntityNames: string[] = r.entities.map( e => e.entity );
            // console.log( r.entities );

            // Must have a UI Property
            const propertyIndex: number = recognizedEntityNames.indexOf( Entities.UI_PROPERTY );
            if ( propertyIndex < 0 ) {
                const msg = 'Unrecognized (' + language + '): ' + node.content;
                warnings.push( new NLPException( msg, node.location ) );
                return;
            }
            const property: string = r.entities[ propertyIndex ].value;

            // Validating
            recognizer.validate( node, recognizedEntityNames, syntaxRules, property, errors, warnings );

            // Getting the values
            let item: UIProperty = node as UIProperty;
            item.property = property;
            for ( let e of r.entities ) {
                //
                // References should be analyzed later, post NLP, in a global Semantic Analysis.
                //
                let entityValue: EntityValue;
                switch ( e.entity ) {
                    case Entities.VALUE             : // next
                    case Entities.NUMBER            : entityValue = new EntityValue( e.entity, adjustValueToTheRightType( e.value ) ); break;
                    // case Entities.VALUE_LIST     : uiv = new EntityValue( e.entity, _this.makeValueList( e.value ) ); break;
                    case Entities.DATE              : entityValue = new EntityValue( e.entity, _this.convertToDateIfNeeded( e.value, language ) ); break;
                    // case Entities.TIME              : entityValue = new EntityValue( e.entity, e.value ); break;
                    // case Entities.TIME_PERIOD       : entityValue = new EntityValue( e.entity, e.value ); break;
                    // case Entities.YEAR_OF           : entityValue = new EntityValue( e.entity, e.value ); break;
                    case Entities.VALUE_LIST        : entityValue = new EntityValue( e.entity, e.value ); break;
                    case Entities.QUERY             : entityValue = new EntityValue( e.entity, e.value ); break;
                    case Entities.UI_ELEMENT_REF    : entityValue = new EntityValue( e.entity, e.value ); break;
                    case Entities.UI_LITERAL        : entityValue = new EntityValue( e.entity, e.value ); break;
                    case Entities.UI_PROPERTY_REF   : entityValue = new EntityValue( e.entity, e.value ); break;
                    case Entities.CONSTANT          : entityValue = new EntityValue( e.entity, e.value ); break;
                    case Entities.UI_DATA_TYPE      : entityValue = new EntityValue( e.entity, e.value ); break;
                    case Entities.BOOL_VALUE        : entityValue = new EntityValue( e.entity, 'true' === e.value ); break;
                    default                         : entityValue = null;
                }
                if ( isDefined( entityValue ) ) {
                    item.value = entityValue;
                    break;
                }
            }

            // A boolean property without value ?
            const booleanProperties: string[] = [ UIPropertyTypes.REQUIRED, UIPropertyTypes.EDITABLE ];
            if ( booleanProperties.indexOf( property ) >= 0 &&
                ! r.entities.find( e => e.entity === Entities.BOOL_VALUE ) ) {
                item.value = new EntityValue( Entities.BOOL_VALUE, true );
            }

            return item;
        };

        recognizer.recognize(
            language,
            nodes,
            [ Intents.UI ],
            'UI Element',
            errors,
            warnings,
            processor
        );

        // this.adjustRecognizedValues( nodes );
    }

    // /**
    //  * Adjust recognized values according to the data type property.
    //  *
    //  * For instance, whether the value is a date expression like "last year"
    //  * but the data type is "integer", the year value should be extracted from
    //  * the existing date.
    //  *
    //  * @param properties Declared properties
    //  */
    // public adjustRecognizedValues( properties: UIProperty[] ): void {

    //     const extractor = new UIElementPropertyExtractor();

    //     const map: Map< UIPropertyTypes, UIProperty[] > =
    //         extractor.mapPropertiesToPropertyTypes( properties );

    //     // const dataType: ValueType = extractor.guessDataType( map );

    //     console.log( '>>> map', map );

    //     if ( map.has( UIPropertyTypes.VALUE ) ) {

    //         console.log( '>>> has value' );

    //         const prop = map.get( UIPropertyTypes.VALUE )[ 0 ];

    //         if ( extractor.hasEntity( prop, Entities.YEAR_OF ) ) {
    //             console.log( '>>>', prop );

    //             prop.value.value = ( prop.value.value as LocalDate ).year();
    //         }

    //     }




    // }

    /**
     * Converts a string value to a date if needed.
     *
     * @param value Value in the format YYYY-MM-DD
     * @param language Language to format
     */
    public convertToDateIfNeeded( value: any, language: string ): any {
        if ( typeof value != 'string' ) {
            return value;
        }
        const f = DateTimeFormatter.ofPattern( "yyyy-MM-dd" );
        try {
            return LocalDate.parse( value, f );
        } catch {
            try {
                // const f2 = DateTimeFormatter.ofPattern( this.dateFormatFrom( language ) );
                // return LocalDate.parse( value, f2 );
                return LocalDate.parse( value );
            } catch {
                // will return original value
            }
        }
        return value;
    }

    // public dateFormatFrom( language: string ): string {
    //     switch ( language ) {
    //         case "pt": return "dd/MM/yyyy";
    //         case "en": return "MM/dd/yyyy";
    //         default: return "yyyy-MM-dd";
    //     }
    // }


    public buildSyntaxRules(): object[] {
        return ( new RuleBuilder() ).build( UI_PROPERTY_SYNTAX_RULES, DEFAULT_UI_PROPERTY_SYNTAX_RULE );
    }

    // public makeValueList( content: string ): any[] {
    //     return content.trim()
    //         .substring( 1, content.length - 1 ) // removes '[' and ']'
    //         .split( Symbols.VALUE_SEPARATOR )   // split values
    //         .map( v => adjustValueToTheRightType( v ) ); // convert type if needed
    // }

}