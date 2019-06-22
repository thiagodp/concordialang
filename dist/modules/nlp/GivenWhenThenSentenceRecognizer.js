"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
/**
 * Given-When-Then sentence recognizer.
 *
 * @author Thiago Delgado Pinto
 */
class GivenWhenThenSentenceRecognizer {
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
        return trainer.trainNLP(this._nlp, language, _1.Intents.TEST_CASE);
    }
    /**
     * Recognize sentences using NLP.
     *
     * @param language Language to be used in the recognition.
     * @param nodes Nodes to be recognized.
     * @param errors Output errors.
     * @param warnings Output warnings.
     * @param ownerName Owner of the sentences.
     *
     * @throws Error If the NLP is not trained.
     */
    recognizeSentences(language, nodes, errors, warnings, ownerName = 'Variant') {
        nodes = nodes || [];
        const recognizer = new _1.NodeSentenceRecognizer(this._nlp);
        const syntaxRules = this._syntaxRules;
        let processor = function (node, r, errors, warnings) {
            if (!r.entities || r.entities.length < 1) {
                const msg = 'Unrecognized entities in: ' + node.content;
                warnings.push(new _1.NLPException(msg, node.location));
                return;
            }
            const recognizedEntityNames = r.entities.map(e => e.entity);
            // ACTION or EXEC ACTION
            const actionIndex = recognizedEntityNames.indexOf(_1.Entities.UI_ACTION);
            const execActionIndex = recognizedEntityNames.indexOf(_1.Entities.EXEC_ACTION);
            if (actionIndex < 0 && execActionIndex < 0) {
                const msg = 'Unrecognized action in: ' + node.content;
                warnings.push(new _1.NLPException(msg, node.location));
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
            // action
            item.action = action;
            // modifier (optional)
            const modifiers = r.entities.filter(e => e.entity === _1.Entities.UI_ACTION_MODIFIER).map(e => e.value);
            if (modifiers.length > 0) {
                item.actionModifier = modifiers[0];
            }
            // options (optional)
            const options = r.entities.filter(e => e.entity === _1.Entities.UI_ACTION_OPTION).map(e => e.value);
            if (options.length > 0) {
                item.actionOptions = options;
            }
            // targets - UI LITERALS (optional)
            item.targets = r.entities.filter(e => e.entity === _1.Entities.UI_LITERAL).map(e => e.value);
            // target types
            item.targetTypes = r.entities.filter(e => e.entity === _1.Entities.UI_ELEMENT_TYPE).map(e => e.value);
            // values (optional)
            item.values = r.entities
                .filter(e => e.entity === _1.Entities.VALUE || e.entity === _1.Entities.NUMBER)
                .map(e => e.value);
            // commands as values (optional)
            let commands = r.entities.filter(e => e.entity === _1.Entities.COMMAND)
                .map(e => e.value.toString());
            for (let cmd of commands) {
                item.values.push(cmd);
            }
            return item;
        };
        recognizer.recognize(language, nodes, [_1.Intents.TEST_CASE], ownerName, errors, warnings, processor);
    }
    buildSyntaxRules() {
        return (new _1.RuleBuilder()).build(_1.UI_ACTION_SYNTAX_RULES, _1.DEFAULT_UI_ACTION_SYNTAX_RULE);
    }
}
exports.GivenWhenThenSentenceRecognizer = GivenWhenThenSentenceRecognizer;
