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

    private _uiPropertyRecognizer: UIPropertyRecognizer;
    private _testCaseSentenceRecognizer: TestCaseSentenceRecognizer;

    constructor( private nlp: NLP, private _defaultLanguage: string = 'en' ) {
        this._uiPropertyRecognizer = new UIPropertyRecognizer( nlp );
        this._testCaseSentenceRecognizer = new TestCaseSentenceRecognizer( nlp );
    }

    public recognizeSentencesInDocument(
        doc: Document,
        errors: LocatedException[],
        warnings: Warning[]
    ) {
        let language = doc.language != null ? doc.language.content : this._defaultLanguage;

        if ( doc.uiElements ) {
            for ( let uiElement of doc.uiElements ) {
                this._uiPropertyRecognizer.recognizeSentences( language, uiElement.items, errors, warnings );
            }
        }

        if ( doc.feature && doc.feature.testcases ) {
            for ( let testCase of doc.feature.testcases ) {
                this._testCaseSentenceRecognizer.recognizeSentences( language, testCase.sentences, errors, warnings );
            }
        }

    }
}