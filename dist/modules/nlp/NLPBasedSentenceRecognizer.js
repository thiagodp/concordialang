"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabasePropertyRecognizer_1 = require("./DatabasePropertyRecognizer");
const VariantSentenceRecognizer_1 = require("./VariantSentenceRecognizer");
const UIPropertyRecognizer_1 = require("./UIPropertyRecognizer");
const NLP_1 = require("./NLP");
const TypeChecking_1 = require("../util/TypeChecking");
/**
 * NLP-based sentence recognizer.
 *
 * @author Thiago Delgado Pinto
 */
class NLPBasedSentenceRecognizer {
    constructor(_nlpTrainer, _useFuzzyProcessor) {
        this._nlpTrainer = _nlpTrainer;
        this._useFuzzyProcessor = _useFuzzyProcessor;
        this._uiPropertyRec = new UIPropertyRecognizer_1.UIPropertyRecognizer(new NLP_1.NLP(_useFuzzyProcessor));
        this._variantSentenceRec = new VariantSentenceRecognizer_1.VariantSentenceRecognizer(new NLP_1.NLP(_useFuzzyProcessor));
        this._dbPropertyRec = new DatabasePropertyRecognizer_1.DatabasePropertyRecognizer(new NLP_1.NLP(_useFuzzyProcessor));
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
    isTrained(language) {
        const t1 = this._uiPropertyRec.isTrained(language);
        const t2 = this._variantSentenceRec.isTrained(language);
        const t3 = this._dbPropertyRec.isTrained(language);
        return t1 && t2 && t3;
    }
    canBeTrained(language) {
        return this._nlpTrainer.canBeTrained(language);
    }
    train(language) {
        const t1 = this._uiPropertyRec.trainMe(this._nlpTrainer, language);
        const t2 = this._variantSentenceRec.trainMe(this._nlpTrainer, language);
        const t3 = this._dbPropertyRec.trainMe(this._nlpTrainer, language);
        return t1 && t2 && t3;
    }
    recognizeSentencesInDocument(doc, language, errors, warnings) {
        //
        // GLOBAL
        //
        // UI Elements
        for (let uiElement of doc.uiElements || []) {
            this._uiPropertyRec.recognizeSentences(language, uiElement.items, errors, warnings);
            for (let item of uiElement.items || []) {
                // Otherwise sentences of items
                this._variantSentenceRec.recognizeSentences(language, item.otherwiseSentences, errors, warnings, 'Otherwise sentences');
            }
        }
        // Databases
        for (let db of doc.databases || []) {
            this._dbPropertyRec.recognizeSentences(language, db.items, errors, warnings);
        }
        // Before All
        if (TypeChecking_1.isDefined(doc.beforeAll)) {
            this._variantSentenceRec.recognizeSentences(language, doc.beforeAll.sentences, errors, warnings, 'Before All');
        }
        // After All
        if (TypeChecking_1.isDefined(doc.afterAll)) {
            this._variantSentenceRec.recognizeSentences(language, doc.afterAll.sentences, errors, warnings, 'After All');
        }
        //
        // LOCAL
        //
        // Test Cases
        for (let tc of doc.testCases || []) {
            this._variantSentenceRec.recognizeSentences(language, tc.sentences, errors, warnings, 'Test Case');
        }
        if (!doc.feature) {
            return;
        }
        // Variant Background
        if (TypeChecking_1.isDefined(doc.feature.variantBackground)) {
            let vb = doc.feature.variantBackground;
            this._variantSentenceRec.recognizeSentences(language, vb.sentences, errors, warnings);
        }
        // UI Elements inside Features
        for (let uiElement of doc.feature.uiElements || []) {
            this._uiPropertyRec.recognizeSentences(language, uiElement.items, errors, warnings);
            for (let item of uiElement.items || []) {
                // Otherwise sentences of items
                this._variantSentenceRec.recognizeSentences(language, item.otherwiseSentences, errors, warnings);
            }
        }
        // Variants and Variant Background inside Scenarios
        for (let scenario of doc.feature.scenarios || []) {
            // Variant Background
            if (TypeChecking_1.isDefined(scenario.variantBackground)) {
                let vb = scenario.variantBackground;
                this._variantSentenceRec.recognizeSentences(language, vb.sentences, errors, warnings, 'Variant Background');
            }
            // Variants
            for (let variant of scenario.variants || []) {
                this._variantSentenceRec.recognizeSentences(language, variant.sentences, errors, warnings);
            }
        }
        // Before Feature
        if (TypeChecking_1.isDefined(doc.beforeFeature)) {
            this._variantSentenceRec.recognizeSentences(language, doc.beforeFeature.sentences, errors, warnings, 'Before Feature');
        }
        // After Feature
        if (TypeChecking_1.isDefined(doc.afterFeature)) {
            this._variantSentenceRec.recognizeSentences(language, doc.afterFeature.sentences, errors, warnings, 'After Feature');
        }
        // Before Each Scenario
        if (TypeChecking_1.isDefined(doc.beforeEachScenario)) {
            this._variantSentenceRec.recognizeSentences(language, doc.beforeEachScenario.sentences, errors, warnings, 'Before Each Scenario');
        }
        // After Each Scenario
        if (TypeChecking_1.isDefined(doc.afterEachScenario)) {
            this._variantSentenceRec.recognizeSentences(language, doc.afterEachScenario.sentences, errors, warnings, 'After Feature');
        }
    }
}
exports.NLPBasedSentenceRecognizer = NLPBasedSentenceRecognizer;
