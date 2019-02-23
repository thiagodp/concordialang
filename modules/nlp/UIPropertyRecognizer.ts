import { NLPResult } from '../../modules/nlp/NLPResult';
import { ContentNode } from '../ast/Node';
import { EntityValue, UIProperty } from '../ast/UIElement';
import { LocatedException } from '../req/LocatedException';
import { isDefined } from '../util/TypeChecking';
import { adjustValueToTheRightType, ValueTypeDetector } from '../util/ValueTypeDetector';
import { Entities } from './Entities';
import { Intents } from './Intents';
import { NLP } from './NLP';
import { NLPException } from './NLPException';
import { NLPTrainer } from './NLPTrainer';
import { NLPResultProcessor, NodeSentenceRecognizer } from './NodeSentenceRecognizer';
import { RuleBuilder } from './RuleBuilder';
import { DEFAULT_UI_PROPERTY_SYNTAX_RULE, UI_PROPERTY_SYNTAX_RULES } from './SyntaxRules';

/**
 * UI element property sentence recognizer.
 *
 * @author Thiago Delgado Pinto
 */
export class UIPropertyRecognizer {

    private _syntaxRules: any[];
    private readonly _valueTypeDetector: ValueTypeDetector = new ValueTypeDetector();

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
        return trainer.trainNLP( this._nlp, language, Intents.UI )
            && trainer.trainNLP( this._nlp, language, Intents.UI_ITEM_QUERY );
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

        let _this = this;

        let processor: NLPResultProcessor = function(
            node: ContentNode,
            r: NLPResult,
            errors: LocatedException[],
            warnings: LocatedException[]
        ): ContentNode {

            const recognizedEntityNames: string[] = r.entities.map( e => e.entity );

            // Must have a UI Property
            const propertyIndex: number = recognizedEntityNames.indexOf( Entities.UI_PROPERTY );
            if ( propertyIndex < 0 ) {
                const msg = 'Unrecognized: ' + node.content;
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
                let uiv: EntityValue;
                switch ( e.entity ) {
                    case Entities.VALUE         : ; // go to next
                    case Entities.NUMBER        : uiv = new EntityValue( e.entity, adjustValueToTheRightType( e.value ) ); break;
                    // case Entities.VALUE_LIST    : uiv = new EntityValue( e.entity, _this.makeValueList( e.value ) ); break;
                    case Entities.VALUE_LIST    : uiv = new EntityValue( e.entity, e.value ); break;
                    case Entities.QUERY         : uiv = new EntityValue( e.entity, e.value ); break;
                    case Entities.UI_ELEMENT    : uiv = new EntityValue( e.entity, e.value ); break;
                    case Entities.UI_LITERAL    : uiv = new EntityValue( e.entity, e.value ); break;
                    case Entities.CONSTANT      : uiv = new EntityValue( e.entity, e.value ); break;
                    case Entities.UI_DATA_TYPE  : uiv = new EntityValue( e.entity, e.value ); break;
                    case Entities.BOOL_VALUE    : uiv = new EntityValue( e.entity, 'true' === e.value ); break;
                    default                     : uiv = null;
                }
                if ( isDefined( uiv ) ) {
                    item.value = uiv;
                    break;
                }
            }

            return item;
        };

        recognizer.recognize(
            language,
            nodes,
            [ Intents.UI, Intents.UI_ITEM_QUERY ],
            'UI Element',
            errors,
            warnings,
            processor
        );
    }


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