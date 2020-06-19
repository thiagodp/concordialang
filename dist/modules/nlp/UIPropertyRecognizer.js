"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIPropertyRecognizer = void 0;
const core_1 = require("@js-joda/core");
const ast_1 = require("../ast");
const UIPropertyTypes_1 = require("../ast/UIPropertyTypes");
const nlp_1 = require("../nlp");
const TypeChecking_1 = require("../util/TypeChecking");
const ValueTypeDetector_1 = require("../util/ValueTypeDetector");
const Intents_1 = require("./Intents");
const NLPException_1 = require("./NLPException");
const NodeSentenceRecognizer_1 = require("./NodeSentenceRecognizer");
const SyntaxRuleBuilder_1 = require("./syntax/SyntaxRuleBuilder");
const UIPropertySyntaxRules_1 = require("./syntax/UIPropertySyntaxRules");
/**
 * UI element property sentence recognizer.
 *
 * @author Thiago Delgado Pinto
 */
class UIPropertyRecognizer {
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
        return trainer.trainNLP(this._nlp, language, Intents_1.Intents.UI);
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
        const recognizer = new NodeSentenceRecognizer_1.NodeSentenceRecognizer(this._nlp);
        const syntaxRules = this._syntaxRules;
        const _this = this;
        let processor = function (node, r, errors, warnings) {
            const recognizedEntityNames = r.entities.map(e => e.entity);
            // console.log( r.entities );
            // Must have a UI Property
            const propertyIndex = recognizedEntityNames.indexOf(nlp_1.Entities.UI_PROPERTY);
            if (propertyIndex < 0) {
                const msg = 'Unrecognized (' + language + '): ' + node.content;
                warnings.push(new NLPException_1.NLPException(msg, node.location));
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
                    case nlp_1.Entities.VALUE: // next
                    case nlp_1.Entities.NUMBER:
                        entityValue = new ast_1.EntityValue(e.entity, ValueTypeDetector_1.adjustValueToTheRightType(e.value));
                        break;
                    // case Entities.VALUE_LIST     : uiv = new EntityValue( e.entity, _this.makeValueList( e.value ) ); break;
                    case nlp_1.Entities.DATE:
                        entityValue = new ast_1.EntityValue(e.entity, _this.convertToDateIfNeeded(e.value, language));
                        break;
                    case nlp_1.Entities.LONG_TIME: // next
                    case nlp_1.Entities.TIME:
                        entityValue = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.LONG_DATE_TIME: // next
                    case nlp_1.Entities.DATE_TIME:
                        entityValue = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.VALUE_LIST:
                        entityValue = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.QUERY:
                        entityValue = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.UI_ELEMENT_REF:
                        entityValue = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.UI_LITERAL:
                        entityValue = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.UI_PROPERTY_REF:
                        entityValue = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.CONSTANT:
                        entityValue = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.UI_DATA_TYPE:
                        entityValue = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.BOOL_VALUE:
                        entityValue = new ast_1.EntityValue(e.entity, 'true' === e.value);
                        break;
                    default: entityValue = null;
                }
                if (TypeChecking_1.isDefined(entityValue)) {
                    item.value = entityValue;
                    break;
                }
            }
            // A boolean property without value ?
            const booleanProperties = [UIPropertyTypes_1.UIPropertyTypes.REQUIRED, UIPropertyTypes_1.UIPropertyTypes.EDITABLE];
            if (booleanProperties.indexOf(property) >= 0 &&
                !r.entities.find(e => e.entity === nlp_1.Entities.BOOL_VALUE)) {
                item.value = new ast_1.EntityValue(nlp_1.Entities.BOOL_VALUE, true);
            }
            return item;
        };
        recognizer.recognize(language, nodes, [Intents_1.Intents.UI], 'UI Element', errors, warnings, processor);
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
        const f = core_1.DateTimeFormatter.ofPattern("uuuu-MM-dd");
        try {
            return core_1.LocalDate.parse(value, f);
        }
        catch (_a) {
            try {
                // const f2 = DateTimeFormatter.ofPattern( this.dateFormatFrom( language ) );
                // return LocalDate.parse( value, f2 );
                return core_1.LocalDate.parse(value);
            }
            catch (_b) {
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
        return (new SyntaxRuleBuilder_1.SyntaxRuleBuilder()).build(UIPropertySyntaxRules_1.UI_PROPERTY_SYNTAX_RULES, UIPropertySyntaxRules_1.DEFAULT_UI_PROPERTY_SYNTAX_RULE);
    }
}
exports.UIPropertyRecognizer = UIPropertyRecognizer;
