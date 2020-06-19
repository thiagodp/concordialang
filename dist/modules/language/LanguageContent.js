"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageContent = void 0;
/**
 * Language content
 *
 * @author Thiago Delgado Pinto
 */
class LanguageContent {
    constructor(keywords = null, nlp = null, training = [], testCaseNames = null) {
        this.keywords = keywords;
        this.nlp = nlp;
        this.training = training;
        this.testCaseNames = testCaseNames;
    }
}
exports.LanguageContent = LanguageContent;
