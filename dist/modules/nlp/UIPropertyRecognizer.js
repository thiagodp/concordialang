"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UIElement_1 = require("../ast/UIElement");
const TypeChecking_1 = require("../util/TypeChecking");
const ValueTypeDetector_1 = require("../util/ValueTypeDetector");
const Entities_1 = require("./Entities");
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
        this._valueTypeDetector = new ValueTypeDetector_1.ValueTypeDetector();
        this._syntaxRules = this.buildSyntaxRules();
    }
    nlp() {
        return this._nlp;
    }
    isTrained(language) {
        return this._nlp.isTrained(language);
    }
    trainMe(trainer, language) {
        return trainer.trainNLP(this._nlp, language, Intents_1.Intents.UI)
            && trainer.trainNLP(this._nlp, language, Intents_1.Intents.UI_ITEM_QUERY);
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
        let _this = this;
        let processor = function (node, r, errors, warnings) {
            const recognizedEntityNames = r.entities.map(e => e.entity);
            // Must have a UI Property
            const propertyIndex = recognizedEntityNames.indexOf(Entities_1.Entities.UI_PROPERTY);
            if (propertyIndex < 0) {
                const msg = 'Unrecognized: ' + node.content;
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
                    case Entities_1.Entities.VALUE: ; // go to next
                    case Entities_1.Entities.NUMBER:
                        uiv = new UIElement_1.EntityValue(e.entity, ValueTypeDetector_1.adjustValueToTheRightType(e.value));
                        break;
                    // case Entities.VALUE_LIST    : uiv = new EntityValue( e.entity, _this.makeValueList( e.value ) ); break;
                    case Entities_1.Entities.VALUE_LIST:
                        uiv = new UIElement_1.EntityValue(e.entity, e.value);
                        break;
                    case Entities_1.Entities.QUERY:
                        uiv = new UIElement_1.EntityValue(e.entity, e.value);
                        break;
                    case Entities_1.Entities.UI_ELEMENT:
                        uiv = new UIElement_1.EntityValue(e.entity, e.value);
                        break;
                    case Entities_1.Entities.UI_LITERAL:
                        uiv = new UIElement_1.EntityValue(e.entity, e.value);
                        break;
                    case Entities_1.Entities.CONSTANT:
                        uiv = new UIElement_1.EntityValue(e.entity, e.value);
                        break;
                    case Entities_1.Entities.UI_DATA_TYPE:
                        uiv = new UIElement_1.EntityValue(e.entity, e.value);
                        break;
                    case Entities_1.Entities.BOOL_VALUE:
                        uiv = new UIElement_1.EntityValue(e.entity, 'true' === e.value);
                        break;
                    default: uiv = null;
                }
                if (TypeChecking_1.isDefined(uiv)) {
                    item.value = uiv;
                    break;
                }
            }
        };
        recognizer.recognize(language, nodes, [Intents_1.Intents.UI, Intents_1.Intents.UI_ITEM_QUERY], 'UI Element', errors, warnings, processor);
    }
    buildSyntaxRules() {
        return (new RuleBuilder_1.RuleBuilder()).build(SyntaxRules_1.UI_PROPERTY_SYNTAX_RULES, SyntaxRules_1.DEFAULT_UI_PROPERTY_SYNTAX_RULE);
    }
}
exports.UIPropertyRecognizer = UIPropertyRecognizer;
