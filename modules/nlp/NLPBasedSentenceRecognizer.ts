import { LocatedException } from '../dbi/LocatedException';
import { Document } from '../ast/Document';
import { Warning } from '../req/Warning';
import { isDefined } from '../util/TypeChecking';
import { DatabasePropertyRecognizer } from './DatabasePropertyRecognizer';
import { GivenWhenThenSentenceRecognizer } from './GivenWhenThenSentenceRecognizer';
import { NLP } from './NLP';
import { NLPTrainer } from './NLPTrainer';
import { UIPropertyRecognizer } from './UIPropertyRecognizer';

/**
 * NLP-based sentence recognizer.
 *
 * @author Thiago Delgado Pinto
 */
export class NLPBasedSentenceRecognizer {

    private _uiPropertyRec: UIPropertyRecognizer;
    private _variantSentenceRec: GivenWhenThenSentenceRecognizer;
    private _dbPropertyRec: DatabasePropertyRecognizer;

    constructor(
        private _nlpTrainer: NLPTrainer,
        private _useFuzzyProcessor?: boolean
    ) {
        this._uiPropertyRec = new UIPropertyRecognizer( new NLP( _useFuzzyProcessor ) );
        this._variantSentenceRec = new GivenWhenThenSentenceRecognizer( new NLP( _useFuzzyProcessor ) );
        this._dbPropertyRec = new DatabasePropertyRecognizer( new NLP( _useFuzzyProcessor ) );
    }

    get uiPropertyRec() {
        return this._uiPropertyRec;
    }

    get variantSentenceRec() {
        return this._variantSentenceRec;
    }

    get dbPropertyRec() {
        return this._dbPropertyRec;
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

            this._uiPropertyRec.recognizeSentences( language, uiElement.items || [], errors, warnings );

            for ( let item of uiElement.items || [] ) {
                // Otherwise sentences of items
                this._variantSentenceRec.recognizeSentences(
                    language, item.otherwiseSentences, errors, warnings, 'Otherwise sentences' );
            }
        }

        // Databases
        for ( let db of doc.databases || [] ) {
            this._dbPropertyRec.recognizeSentences( language, db.items, errors, warnings );
        }

        // Before All
        if ( isDefined( doc.beforeAll ) ) {
            this._variantSentenceRec.recognizeSentences(
                language, doc.beforeAll.sentences, errors, warnings, 'Before All' );
        }

        // After All
        if ( isDefined( doc.afterAll ) ) {
            this._variantSentenceRec.recognizeSentences(
                language, doc.afterAll.sentences, errors, warnings, 'After All' );
        }

        //
        // LOCAL
        //

        // Test Cases
        for ( let tc of doc.testCases || [] ) {
            this._variantSentenceRec.recognizeSentences(
                language, tc.sentences, errors, warnings, 'Test Case' );
        }

        if ( ! doc.feature ) {
            return;
        }

        // Variant Background
        if ( isDefined( doc.feature.variantBackground ) ) {
            let vb = doc.feature.variantBackground;
            this._variantSentenceRec.recognizeSentences(
                language, vb.sentences, errors, warnings );
        }

        // UI Elements inside Features
        for ( let uiElement of doc.feature.uiElements || [] ) {

            this._uiPropertyRec.recognizeSentences(
                language, uiElement.items, errors, warnings );

            for ( let item of uiElement.items || [] ) {
                if ( ! item ) {
                    continue;
                }
                // Otherwise sentences of items
                this._variantSentenceRec.recognizeSentences(
                    language, item.otherwiseSentences || [], errors, warnings );
            }
        }

        // Variants and Variant Background inside Scenarios
        for ( let scenario of doc.feature.scenarios || [] ) {

            // Variant Background
            if ( isDefined( scenario.variantBackground ) ) {
                let vb = scenario.variantBackground;
                this._variantSentenceRec.recognizeSentences(
                    language, vb.sentences, errors, warnings, 'Variant Background' );
            }

            // Variants
            for ( let variant of scenario.variants || [] ) {
                this._variantSentenceRec.recognizeSentences(
                    language, variant.sentences, errors, warnings );
            }
        }

        // Before Feature
        if ( isDefined( doc.beforeFeature ) ) {
            this._variantSentenceRec.recognizeSentences(
                language, doc.beforeFeature.sentences, errors, warnings, 'Before Feature' );
        }

        // After Feature
        if ( isDefined( doc.afterFeature ) ) {
            this._variantSentenceRec.recognizeSentences(
                language, doc.afterFeature.sentences, errors, warnings, 'After Feature' );
        }

        // Before Each Scenario
        if ( isDefined( doc.beforeEachScenario ) ) {
            this._variantSentenceRec.recognizeSentences(
                language, doc.beforeEachScenario.sentences, errors, warnings, 'Before Each Scenario' );
        }

        // After Each Scenario
        if ( isDefined( doc.afterEachScenario ) ) {
            this._variantSentenceRec.recognizeSentences(
                language, doc.afterEachScenario.sentences, errors, warnings, 'After Feature' );
        }

    }

}