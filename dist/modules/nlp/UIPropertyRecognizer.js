import { DateTimeFormatter, LocalDate } from '@js-joda/core';
import { EntityValue } from '../ast';
import { UIPropertyTypes } from '../ast/UIPropertyTypes';
import { Entities } from '../nlp/Entities';
import { isDefined } from '../util/type-checking';
import { adjustValueToTheRightType } from '../util/ValueTypeDetector';
import { Intents } from './Intents';
import { NLPException } from './NLPException';
import { NodeSentenceRecognizer } from './NodeSentenceRecognizer';
import { SyntaxRuleBuilder } from './syntax/SyntaxRuleBuilder';
import { DEFAULT_UI_PROPERTY_SYNTAX_RULE, UI_PROPERTY_SYNTAX_RULES } from './syntax/UIPropertySyntaxRules';
/**
 * UI element property sentence recognizer.
 *
 * @author Thiago Delgado Pinto
 */
export class UIPropertyRecognizer {
    constructor(_nlp) {
        this._nlp = _nlp;
        this._syntaxRules = this.buildSyntaxRules();
    }
    nlp() {
        return this._nlp;
    }
    isTrained(language) {
        return this._nlp.isTrained(language);
    }
    trainMe(trainer, language) {
        return trainer.trainNLP(this._nlp, language, Intents.UI);
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
    recognizeSentences(language, nodes, errors, warnings) {
        const recognizer = new NodeSentenceRecognizer(this._nlp);
        const syntaxRules = this._syntaxRules;
        const _this = this;
        let processor = function (node, r, errors, warnings) {
            const recognizedEntityNames = r.entities.map(e => e.entity);
            // console.log( r.entities );
            // Must have a UI Property
            const propertyIndex = recognizedEntityNames.indexOf(Entities.UI_PROPERTY);
            if (propertyIndex < 0) {
                const msg = 'Unrecognized (' + language + '): ' + node.content;
                warnings.push(new NLPException(msg, node.location));
                return;
            }
            const property = r.entities[propertyIndex].value;
            // Validating
            recognizer.validate(node, recognizedEntityNames, syntaxRules, property, errors, warnings);
            // Getting the values
            let item = node;
            item.property = property;
            for (let e of r.entities) {
                //
                // References should be analyzed later, post NLP, in a global Semantic Analysis.
                //
                let entityValue;
                switch (e.entity) {
                    case Entities.VALUE: // next
                    case Entities.NUMBER:
                        entityValue = new EntityValue(e.entity, adjustValueToTheRightType(e.value));
                        break;
                    // case Entities.VALUE_LIST     : uiv = new EntityValue( e.entity, _this.makeValueList( e.value ) ); break;
                    case Entities.DATE:
                        entityValue = new EntityValue(e.entity, _this.convertToDateIfNeeded(e.value, language));
                        break;
                    case Entities.LONG_TIME: // next
                    case Entities.TIME:
                        entityValue = new EntityValue(e.entity, e.value);
                        break;
                    case Entities.LONG_DATE_TIME: // next
                    case Entities.DATE_TIME:
                        entityValue = new EntityValue(e.entity, e.value);
                        break;
                    case Entities.VALUE_LIST:
                        entityValue = new EntityValue(e.entity, e.value);
                        break;
                    case Entities.QUERY:
                        entityValue = new EntityValue(e.entity, e.value);
                        break;
                    case Entities.UI_ELEMENT_REF:
                        entityValue = new EntityValue(e.entity, e.value);
                        break;
                    case Entities.UI_LITERAL:
                        entityValue = new EntityValue(e.entity, e.value);
                        break;
                    case Entities.UI_PROPERTY_REF:
                        entityValue = new EntityValue(e.entity, e.value);
                        break;
                    case Entities.CONSTANT:
                        entityValue = new EntityValue(e.entity, e.value);
                        break;
                    case Entities.UI_DATA_TYPE:
                        entityValue = new EntityValue(e.entity, e.value);
                        break;
                    case Entities.BOOL_VALUE:
                        entityValue = new EntityValue(e.entity, 'true' === e.value);
                        break;
                    default: entityValue = null;
                }
                if (isDefined(entityValue)) {
                    item.value = entityValue;
                    break;
                }
            }
            // A boolean property without value ?
            const booleanProperties = [UIPropertyTypes.REQUIRED, UIPropertyTypes.EDITABLE];
            if (booleanProperties.indexOf(property) >= 0 &&
                !r.entities.find(e => e.entity === Entities.BOOL_VALUE)) {
                item.value = new EntityValue(Entities.BOOL_VALUE, true);
            }
            return item;
        };
        recognizer.recognize(language, nodes, [Intents.UI], 'UI Element', errors, warnings, processor);
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
    convertToDateIfNeeded(value, language) {
        if (typeof value != 'string') {
            return value;
        }
        const f = DateTimeFormatter.ofPattern("uuuu-MM-dd");
        try {
            return LocalDate.parse(value, f);
        }
        catch {
            try {
                // const f2 = DateTimeFormatter.ofPattern( this.dateFormatFrom( language ) );
                // return LocalDate.parse( value, f2 );
                return LocalDate.parse(value);
            }
            catch {
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
    buildSyntaxRules() {
        return (new SyntaxRuleBuilder()).build(UI_PROPERTY_SYNTAX_RULES, DEFAULT_UI_PROPERTY_SYNTAX_RULE);
    }
}
