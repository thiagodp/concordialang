"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Intents_1 = require("./Intents");
const NodeSentenceRecognizer_1 = require("./NodeSentenceRecognizer");
const NLPException_1 = require("./NLPException");
const Entities_1 = require("./Entities");
const RuleBuilder_1 = require("./RuleBuilder");
const SyntaxRules_1 = require("./SyntaxRules");
/**
 * Variant sentence recognizer.
 *
 * @author Thiago Delgado Pinto
 */
class VariantSentenceRecognizer {
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
        return trainer.trainNLP(this._nlp, language, Intents_1.Intents.TEST_CASE);
    }
    /**
     * Recognize sentences using NLP.
     *
     * @param language Language to be used in the recognition.
     * @param nodes Nodes to be recognized.
     * @param errors Output errors.
     * @param warnings Output warnings.
     *
     * @throws Error If the NLP is not trained.
     */
    recognizeSentences(language, nodes, errors, warnings, variantName = 'Variant') {
        const recognizer = new NodeSentenceRecognizer_1.NodeSentenceRecognizer(this._nlp);
        const syntaxRules = this._syntaxRules;
        let processor = function (node, r, errors, warnings) {
            if (!r.entities || r.entities.length < 1) {
                const msg = 'Unrecognized entities in: ' + node.content;
                warnings.push(new NLPException_1.NLPException(msg, node.location));
                return;
            }
            //console.log( 'Entities', r.entities );
            const recognizedEntityNames = r.entities.map(e => e.entity);
            // ACTION or EXEC ACTION
            const actionIndex = recognizedEntityNames.indexOf(Entities_1.Entities.UI_ACTION);
            const execActionIndex = recognizedEntityNames.indexOf(Entities_1.Entities.EXEC_ACTION);
            if (actionIndex < 0 && execActionIndex < 0) {
                const msg = 'Unrecognized action in: ' + node.content;
                warnings.push(new NLPException_1.NLPException(msg, node.location));
                return;
            }
            let action;
            if (actionIndex >= 0) {
                action = r.entities[actionIndex].value;
                // validate the action
                recognizer.validate(node, recognizedEntityNames, syntaxRules, action, errors, warnings);
            }
            else if (execActionIndex > 0) {
                action = r.entities[execActionIndex].value;
            }
            let item = node;
            // Action
            item.action = action;
            // Action modifier (optional)
            const modifiers = r.entities.filter(e => e.entity === Entities_1.Entities.UI_ACTION_MODIFIER).map(e => e.value);
            if (modifiers.length > 0) {
                item.actionModifier = modifiers[0];
            }
            // Action option (optional)
            const options = r.entities.filter(e => e.entity === Entities_1.Entities.UI_ACTION_OPTION).map(e => e.value);
            if (options.length > 0) {
                item.actionOptions = options;
            }
            // Targets - UI LITERALS (optional)
            item.targets = r.entities.filter(e => e.entity === Entities_1.Entities.UI_LITERAL).map(e => e.value);
            // Target Types
            item.targetTypes = r.entities.filter(e => e.entity === Entities_1.Entities.UI_ELEMENT_TYPE).map(e => e.value);
            // VALUES (optional)
            item.values = r.entities
                .filter(e => e.entity === Entities_1.Entities.VALUE || e.entity === Entities_1.Entities.NUMBER)
                .map(e => e.value);
        };
        recognizer.recognize(language, nodes, [Intents_1.Intents.TEST_CASE], variantName, errors, warnings, processor);
    }
    buildSyntaxRules() {
        return (new RuleBuilder_1.RuleBuilder()).build(SyntaxRules_1.UI_ACTION_SYNTAX_RULES, SyntaxRules_1.DEFAULT_UI_ACTION_SYNTAX_RULE);
    }
}
exports.VariantSentenceRecognizer = VariantSentenceRecognizer;
//# sourceMappingURL=VariantSentenceRecognizer.js.map