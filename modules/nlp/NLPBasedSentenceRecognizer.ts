import { Intents } from './Intents';
import { NLPTrainer } from './NLPTrainer';
import { DatabasePropertyRecognizer } from './DatabasePropertyRecognizer';
import { NLPException } from './NLPException';
import { VariantSentenceRecognizer } from './VariantSentenceRecognizer';
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
    private _variantSentenceRec: VariantSentenceRecognizer;
    private _dbPropertyRec: DatabasePropertyRecognizer;

    constructor(
        private _nlpTrainer: NLPTrainer,
        private _useFuzzyProcessor?: boolean
    ) {
        this._uiPropertyRec = new UIPropertyRecognizer( new NLP( _useFuzzyProcessor ) );
        this._variantSentenceRec = new VariantSentenceRecognizer( new NLP( _useFuzzyProcessor ) );
        this._dbPropertyRec = new DatabasePropertyRecognizer( new NLP( _useFuzzyProcessor ) );
    }

    public isTrained( language: string ): boolean {
        const t1: boolean = this._uiPropertyRec.isTrained( language );
        const t2: boolean = this._variantSentenceRec.isTrained( language );
        const t3: boolean = this._dbPropertyRec.isTrained( language );
        return t1 && t2 && t3;
    }

    public canBeTrained( language: string ): boolean {
        return this._nlpTrainer.canBeTrained( language );
    }

    public train( language: string ): boolean {
        const t1: boolean = this._uiPropertyRec.trainMe( this._nlpTrainer, language );
        const t2: boolean = this._variantSentenceRec.trainMe( this._nlpTrainer, language );
        const t3: boolean = this._dbPropertyRec.trainMe( this._nlpTrainer, language );
        return t1 && t2 && t3;
    }

    public recognizeSentencesInDocument(
        doc: Document,
        language: string,
        errors: LocatedException[],
        warnings: Warning[]
    ): void {

        //
        // GLOBAL
        //


        // UI Elements
        for ( let uiElement of doc.uiElements || [] ) {
            this._uiPropertyRec.recognizeSentences( language, uiElement.items, errors, warnings );
        }

        // Databases
        for ( let db of doc.databases || [] ) {
            this._dbPropertyRec.recognizeSentences( language, db.items, errors, warnings );
        }

        //
        // LOCAL
        //

        if ( ! doc.feature ) {
            return;
        }

        // UI Elements inside Features
        for ( let uiElement of doc.feature.uiElements || [] ) {
            this._uiPropertyRec.recognizeSentences(
                language, uiElement.items, errors, warnings );
        }

        // Variants inside Scenarios
        for ( let scenario of doc.feature.scenarios || [] ) {
            for ( let variant of scenario.variants || [] ) {
                this._variantSentenceRec.recognizeSentences(
                    language, variant.sentences, errors, warnings );
            }
        }

        // Test Cases inside Features
        for ( let testCase of doc.feature.testCases || [] ) {
            this._variantSentenceRec.recognizeSentences(
                language, testCase.sentences, errors, warnings, 'Test Case' );
        }

    }
}