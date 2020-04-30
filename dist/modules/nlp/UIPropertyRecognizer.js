"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_1 = require("../ast");
const UIPropertyTypes_1 = require("../ast/UIPropertyTypes");
const nlp_1 = require("../nlp");
const TypeChecking_1 = require("../util/TypeChecking");
const ValueTypeDetector_1 = require("../util/ValueTypeDetector");
const Intents_1 = require("./Intents");
const NLPException_1 = require("./NLPException");
const NodeSentenceRecognizer_1 = require("./NodeSentenceRecognizer");
const RuleBuilder_1 = require("./RuleBuilder");
const SyntaxRules_1 = require("./SyntaxRules");
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
        // let _this = this;
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
                let uiv;
                switch (e.entity) {
                    case nlp_1.Entities.VALUE: // next
                    case nlp_1.Entities.NUMBER:
                        uiv = new ast_1.EntityValue(e.entity, ValueTypeDetector_1.adjustValueToTheRightType(e.value));
                        break;
                    // case Entities.VALUE_LIST     : uiv = new EntityValue( e.entity, _this.makeValueList( e.value ) ); break;
                    case nlp_1.Entities.TIME:
                        uiv = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.DATE:
                        uiv = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.TIME_PERIOD:
                        uiv = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.VALUE_LIST:
                        uiv = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.QUERY:
                        uiv = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.UI_ELEMENT_REF:
                        uiv = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.UI_LITERAL:
                        uiv = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.UI_PROPERTY_REF:
                        uiv = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.CONSTANT:
                        uiv = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.UI_DATA_TYPE:
                        uiv = new ast_1.EntityValue(e.entity, e.value);
                        break;
                    case nlp_1.Entities.BOOL_VALUE:
                        uiv = new ast_1.EntityValue(e.entity, 'true' === e.value);
                        break;
                    default: uiv = null;
                }
                if (TypeChecking_1.isDefined(uiv)) {
                    item.value = uiv;
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
        recognizer.recognize(language, nodes, [Intents_1.Intents.UI], // [ Intents.UI, Intents.UI_ITEM_QUERY ],
        'UI Element', errors, warnings, processor);
    }
    buildSyntaxRules() {
        return (new RuleBuilder_1.RuleBuilder()).build(SyntaxRules_1.UI_PROPERTY_SYNTAX_RULES, SyntaxRules_1.DEFAULT_UI_PROPERTY_SYNTAX_RULE);
    }
}
exports.UIPropertyRecognizer = UIPropertyRecognizer;
