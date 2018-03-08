import { KeywordDictionary } from "./KeywordDictionary";
import { NLPTrainingIntentExample } from "../nlp/NLPTrainingData";
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
        public training: NLPTrainingIntentExample[] = [],
        public testCaseNames: DataTestCaseNames = null
    ) {
    }
}