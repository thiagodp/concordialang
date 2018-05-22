"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NLPTrainingDataConversor_1 = require("./NLPTrainingDataConversor");
const TypeChecking_1 = require("../util/TypeChecking");
/**
 * NLP trainer.
 *
 * @author Thiago Delgado Pinto
 */
class NLPTrainer {
    constructor(_langLoader) {
        this._langLoader = _langLoader;
        this._convertedData = new Map();
    }
    canBeTrained(language) {
        return this._langLoader.has(language);
    }
    trainNLP(nlp, language, intentNameFilter) {
        if (!this.canBeTrained(language)) {
            return false;
        }
        let data = this._convertedData[language];
        if (!data) {
            let content = this._langLoader.load(language);
            // Copy "ui_element_type" from "testcase" to "ui"
            if (TypeChecking_1.isDefined(content.nlp["testcase"])
                && TypeChecking_1.isDefined(content.nlp["testcase"]["ui_element_type"])
                && TypeChecking_1.isDefined(content.nlp["ui"]
                    && !TypeChecking_1.isDefined(content.nlp["ui"]["ui_element_type"]))) {
                content.nlp["ui"]["ui_element_type"] = content.nlp["testcase"]["ui_element_type"];
            }
            let conversor = new NLPTrainingDataConversor_1.NLPTrainingDataConversor();
            data = conversor.convert(content.nlp || {}, content.training || []);
            this._convertedData[language] = data;
        }
        else {
            data = this._convertedData[language];
        }
        nlp.train(language, data, intentNameFilter);
        return true;
    }
}
exports.NLPTrainer = NLPTrainer;
//# sourceMappingURL=NLPTrainer.js.map