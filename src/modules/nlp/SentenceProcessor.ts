import { NLPException } from './NLPException';
import { Document } from '../ast/Document';
import { TestCase } from '../ast/TestCase';
import { Step } from '../ast/Step';
import { NLP, NLPResult } from './NLP';

/**
 * Sentence processor
 */
export class SentenceProcessor {

    constructor( private _nlp: NLP ) {
    }

    process( doc: Document ) {

        if ( ! this._nlp.isTrained() ) {
            throw new Error( 'A trained NLP is required.' );
        }

        // Test Cases
        if ( doc.feature && doc.feature.testcases ) {
            for ( let tc of doc.feature.testcases ) {
                this.analyzeTestCaseSentences( tc.sentences, doc.fileErrors );
            }            
        }
    }

    analyzeTestCaseSentences( sentences: Step[], errors: Error[] ) {
        for ( let s of sentences ) {
            let r: NLPResult = this._nlp.recognize( s.content );
            // Not recognized?
            if ( ! r ) {
                let msg = 'Unrecognized sentence: "' + s.content + '".';
                errors.push( new NLPException( msg, s.location ) );
                continue;
            }
            // Intent different from a test case?
            if ( 'testcase' != r.intent ) {
                let msg = 'Sentence not recognized as part of a test case: "' + s.content + '".';
                errors.push( new NLPException( msg, s.location ) );
                continue;
            }
            // Let's transform the results into commands
            // ... <<< TO-DO
        }
    }

}