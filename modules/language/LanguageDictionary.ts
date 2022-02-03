import { NLPTrainingIntentExample } from '../nlp';
import { DataTestCaseNames } from '../testdata/DataTestCaseNames';
import { KeywordDictionary } from './KeywordDictionary';

export interface LanguageDictionary {

    keywords: KeywordDictionary;

    nlp: object;

    training: NLPTrainingIntentExample[];

    testCaseNames: DataTestCaseNames;

}
