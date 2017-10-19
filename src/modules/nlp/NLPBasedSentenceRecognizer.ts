import { DatabasePropertyRecognizer } from './DatabasePropertyRecognizer';
import { NLPException } from './NLPException';
import { TestCaseSentenceRecognizer } from './TestCaseSentenceRecognizer';
import { UIPropertyRecognizer } from './UIPropertyRecognizer';
import { Warning } from '../req/Warning';
import { LocatedException } from '../req/LocatedException';
import { Document } from '../ast/Document';
import { NLP } from './NLP';

/**
 * NLP-based sentence recognizer.
 * 
 * @author Thiago Delgado Pinto
 */
export class NLPBasedSentenceRecognizer {

    private _uiPropertyRec: UIPropertyRecognizer;
    private _testCaseSentenceRec: TestCaseSentenceRecognizer;
    private _dbPropertyRec: DatabasePropertyRecognizer;

    constructor( private nlp: NLP, private _defaultLanguage: string = 'en' ) {
        this._uiPropertyRec = new UIPropertyRecognizer( nlp );
        this._testCaseSentenceRec = new TestCaseSentenceRecognizer( nlp );
        this._dbPropertyRec = new DatabasePropertyRecognizer( nlp );
    }

    public recognizeSentencesInDocument(
        doc: Document,
        errors: LocatedException[],
        warnings: Warning[]
    ): void {
        
        let language = doc.language != null ? doc.language.value : this._defaultLanguage;

        // Global

        if ( doc.uiElements ) {
            for ( let uiElement of doc.uiElements ) {
                this._uiPropertyRec.recognizeSentences( language, uiElement.items, errors, warnings );
            }
        }

        if ( doc.databases ) {
            for ( let db of doc.databases ) {
                this._dbPropertyRec.recognizeSentences( language, db.items, errors, warnings );                
            }
        }

        // Local
        if ( ! doc.feature ) {
            return;
        }

        for ( let uiElement of doc.feature.uiElements ) {
            this._uiPropertyRec.recognizeSentences( language, uiElement.items, errors, warnings );
        }

        for ( let testCase of doc.feature.testcases ) {
            this._testCaseSentenceRec.recognizeSentences( language, testCase.sentences, errors, warnings );
        }

    }
}