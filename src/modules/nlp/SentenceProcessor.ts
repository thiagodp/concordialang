import { UIElementItem } from '../ast/UIElement';
import { NLPException } from './NLPException';
import { Document } from '../ast/Document';
import { TestCase } from '../ast/TestCase';
import { Step } from '../ast/Step';
import { NLP, NLPResult } from './NLP';
import { ContentNode } from '../ast/Node';
import { Entities } from './Entities';

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

    public analyzeTestCaseSentences( sentences: Step[], errors: Error[] ) {

        let processor = function( sentence: ContentNode, r: NLPResult, errors: Error[] ) {
            // TO-DO
        };

        const TARGET_INTENT = 'testcase';
        const TARGET_NAME = 'Test Case';
        this.analyzeSentences( sentences, TARGET_INTENT, TARGET_NAME, errors, processor );
    }


    public analyzeUIElementItems( sentences: Step[], errors: Error[] ) {

        let processor = function( sentence: ContentNode, r: NLPResult, errors: Error[] ) {
            
            let entityNames = r.entities.map( e => e.entity );
            
            // Checking the property
            const propertyIndex = entityNames.indexOf( Entities.UI_PROPERTY );
            if ( propertyIndex < 0 ) {
                const msg = 'Unrecognized property in "' + sentence.content + '".';
                errors.push( new NLPException( msg, sentence.location ) );
            }
            const propertyValue = r.entities[ propertyIndex ].value;

            // Checking the value ?
            // TO-DO

            let item: UIElementItem = sentence as UIElementItem;
            item.property = propertyValue;
        };

        const TARGET_INTENT = 'ui';
        const TARGET_NAME = 'UI Element';
        this.analyzeSentences( sentences, TARGET_INTENT, TARGET_NAME, errors, processor );
    }

    
    public analyzeSentences(
        sentences: ContentNode[],
        targetIntent: string,
        targetName: string,
        errors: Error[],
        resultProcessor: ( sentence: ContentNode, r: NLPResult, errors: Error[] ) => void
    ): NLPResult[] {
        let results: NLPResult[] = [];
        for ( let s of sentences ) {
            let r: NLPResult = this._nlp.recognize( s.content, targetIntent );
            // Not recognized?
            if ( ! r ) {
                let msg = 'Unrecognized sentence: "' + s.content + '".';
                errors.push( new NLPException( msg, s.location ) );
                continue;
            }
            // Different intent?
            if ( targetIntent != r.intent ) {
                let msg = 'Sentence not recognized as part of a ' + targetName + ': "' + s.content + '".';
                errors.push( new NLPException( msg, s.location ) );
                continue;
            }
            // Process the result
            resultProcessor( s, r, errors );
        }
        return results;
    }   

}