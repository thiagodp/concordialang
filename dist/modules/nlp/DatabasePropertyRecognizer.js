"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const concordialang_types_1 = require("concordialang-types");
const Intents_1 = require("./Intents");
const NLPException_1 = require("./NLPException");
const NodeSentenceRecognizer_1 = require("./NodeSentenceRecognizer");
const RuleBuilder_1 = require("./RuleBuilder");
const SyntaxRules_1 = require("./SyntaxRules");
/**
 * Database property sentence recognizer.
 *
 * @author Thiago Delgado Pinto
 */
class DatabasePropertyRecognizer {
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
        return trainer.trainNLP(this._nlp, language, Intents_1.Intents.DATABASE);
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
        let processor = function (node, r, errors, warnings) {
            const recognizedEntityNames = r.entities.map(e => e.entity);
            // Must have a DS Property
            const propertyIndex = recognizedEntityNames.indexOf(concordialang_types_1.Entities.DB_PROPERTY);
            if (propertyIndex < 0) {
                const msg = 'Unrecognized: ' + node.content;
                warnings.push(new NLPException_1.NLPException(msg, node.location));
                return;
            }
            const property = r.entities[propertyIndex].value;
            // Validating
            recognizer.validate(node, recognizedEntityNames, syntaxRules, property, errors, warnings);
            // Getting the values
            let values = r.entities
                .filter(e => e.entity == concordialang_types_1.Entities.VALUE || e.entity == concordialang_types_1.Entities.NUMBER)
                .map(e => e.value);
            if (values.length < 1) {
                const msg = 'Value expected in the sentence "' + node.content + '".';
                errors.push(new NLPException_1.NLPException(msg, node.location));
                return;
            }
            let item = node;
            item.property = property;
            item.value = values[0];
            return item;
        };
        recognizer.recognize(language, nodes, [Intents_1.Intents.DATABASE], 'Database Property', errors, warnings, processor);
    }
    buildSyntaxRules() {
        return (new RuleBuilder_1.RuleBuilder()).build(SyntaxRules_1.DATABASE_PROPERTY_SYNTAX_RULES, SyntaxRules_1.DEFAULT_DATABASE_PROPERTY_SYNTAX_RULE);
    }
}
exports.DatabasePropertyRecognizer = DatabasePropertyRecognizer;
