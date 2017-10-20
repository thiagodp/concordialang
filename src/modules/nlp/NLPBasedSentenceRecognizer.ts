import { Intents } from './Intents';
import { NLPTrainer } from './NLPTrainer';
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

    private _nlpTrainer: NLPTrainer;
    private _uiPropertyRec: UIPropertyRecognizer;
    private _testCaseSentenceRec: TestCaseSentenceRecognizer;
    private _dbPropertyRec: DatabasePropertyRecognizer;

    constructor(
        private dataDir?: string,
        private _defaultLanguage: string = 'en',
        private _useFuzzyProcessor: boolean = false
    ) {
        this._nlpTrainer = new NLPTrainer( dataDir );
        this._uiPropertyRec = new UIPropertyRecognizer( new NLP( _useFuzzyProcessor ) );
        this._testCaseSentenceRec = new TestCaseSentenceRecognizer( new NLP( _useFuzzyProcessor ) );
        this._dbPropertyRec = new DatabasePropertyRecognizer( new NLP( _useFuzzyProcessor ) );
    }

    public isTrained( language: string ): boolean {
        return this._uiPropertyRec.nlp().isTrained( language )
            && this._testCaseSentenceRec.nlp().isTrained( language )
            && this._dbPropertyRec.nlp().isTrained( language );
    }

    public canBeTrained( language: string ): boolean {
        return this._nlpTrainer.canBeTrained( language );
    }

    public train( language: string ): boolean {
        return this._uiPropertyRec.trainMe( this._nlpTrainer, language )
            && this._testCaseSentenceRec.trainMe( this._nlpTrainer, language )
            && this._dbPropertyRec.trainMe( this._nlpTrainer, language );
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