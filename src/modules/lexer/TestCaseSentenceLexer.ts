import { TestCaseSentence } from '../ast/TestCase';
import { StartingKeywordLexer } from './StartingKeywordLexer';
import { Keywords } from "../req/Keywords";

/**
 * Detects a Test Case Sentence node.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestCaseSentenceLexer extends StartingKeywordLexer< TestCaseSentence > {

    constructor( words: string[] ) {
        super( words, Keywords.TEST_CASE_SENTENCE );
    }

}