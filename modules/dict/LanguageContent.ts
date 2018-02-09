import { KeywordDictionary } from "./KeywordDictionary";
import { NLPIntentExample } from "../nlp/NLPTrainingData";
import { DataTestCaseNames } from "../testdata/DataTestCaseNames";

/**
 * Language content
 * 
 * @author Thiago Delgado Pinto
 */
export class LanguageContent {

    constructor(
        public keywords: KeywordDictionary = null,
        public nlp: object = null,
        public training: NLPIntentExample[] = [],
        public testCaseNames: DataTestCaseNames = null
    ) {
    }
}