"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bravey = require("../../lib/bravey"); // .js file
const core_1 = require("@js-joda/core");
const nlp_1 = require("../nlp");
const EntityRecognizerMaker_1 = require("./EntityRecognizerMaker");
/**
 * Natural Language Processor
 *
 * @author Thiago Delgado Pinto
 */
class NLP {
    constructor(_useFuzzyProcessor = true) {
        this._useFuzzyProcessor = _useFuzzyProcessor;
        this._nlpMap = {}; // Maps language => Bravey.NLP
        this._additionalEntities = [];
        this._additionalRecognizers = [];
        const erMaker = new EntityRecognizerMaker_1.EntityRecognizerMaker();
        // Add an entity named "value" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.VALUE);
        this._additionalRecognizers.push(erMaker.makeValue(nlp_1.Entities.VALUE));
        // Add an entity named "ui_element" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.UI_ELEMENT_REF);
        this._additionalRecognizers.push(erMaker.makeUIElementReference(nlp_1.Entities.UI_ELEMENT_REF));
        // Add an entity named "ui_property_ref" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.UI_PROPERTY_REF);
        this._additionalRecognizers.push(erMaker.makeUIPropertyReference(nlp_1.Entities.UI_PROPERTY_REF));
        // Add an entity named "ui_element_literal" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.UI_LITERAL);
        this._additionalRecognizers.push(erMaker.makeUILiteral(nlp_1.Entities.UI_LITERAL));
        // Add an entity named "number" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.NUMBER);
        this._additionalRecognizers.push(erMaker.makeNumber(nlp_1.Entities.NUMBER));
        // Add an entity named "query" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.QUERY);
        this._additionalRecognizers.push(erMaker.makeQuery(nlp_1.Entities.QUERY));
        // Add an entity named "constant" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.CONSTANT);
        this._additionalRecognizers.push(erMaker.makeConstant(nlp_1.Entities.CONSTANT));
        // Add an entity named "value_list" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.VALUE_LIST);
        this._additionalRecognizers.push(erMaker.makeValueList(nlp_1.Entities.VALUE_LIST));
        // Add an entity named "state" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.STATE);
        this._additionalRecognizers.push(erMaker.makeState(nlp_1.Entities.STATE));
        // Add an entity named "command" and its recognizer
        this._additionalEntities.push(nlp_1.Entities.COMMAND);
        this._additionalRecognizers.push(erMaker.makeCommand(nlp_1.Entities.COMMAND));
        // Language-based entities
        this._additionalEntities.push(nlp_1.Entities.DATE);
        this._additionalEntities.push(nlp_1.Entities.TIME);
        this._additionalEntities.push(nlp_1.Entities.DATE_TIME);
        // this._additionalEntities.push( Entities.TIME_PERIOD );
        // this._additionalEntities.push( Entities.YEAR_OF );
    }
    /**
     * Train the recognizer.
     *
     * @param language Target language.
     * @param data Data to be used in the training.
     * @param intentNameFilter Filter for training only using certain intent. Optional. Default undefined.
     */
    train(language, data, intentNameFilter = undefined) {
        if (!this._nlpMap[language]) {
            this._nlpMap[language] = { nlp: this.createNLP(), isTrained: true };
        }
        else {
            this._nlpMap[language].isTrained = true;
        }
        let nlp = this._nlpMap[language].nlp;
        // Add intents and their recognizers
        for (let intent of data.intents) {
            // Ignores the intent if it is equal to the filter (if defined)
            if (intentNameFilter && intentNameFilter != intent.name) {
                continue; // ignore the intent
            }
            let entities = intent.entities.map(e => { return { id: e.name, entity: e.name }; });
            this.addDefaultEntitiesTo(entities);
            // Add the intent with its entities
            nlp.addIntent(intent.name, entities);
            // Add entity recognizers with matches. Each match have sample values, that
            // are added to the recognizer.
            for (let e of intent.entities) {
                let priority = undefined;
                if (data.priorities && data.priorities[intent.name] && data.priorities[intent.name][e.name]) {
                    priority = data.priorities[intent.name][e.name];
                }
                let entityRec = new Bravey.StringEntityRecognizer(e.name, priority);
                for (let m of e.matches) {
                    for (let sample of m.samples) {
                        entityRec.addMatch(m.id, sample);
                    }
                }
                nlp.addEntity(entityRec);
            }
        }
        // Add default recognizers
        this.addDefaultRecognizersTo(nlp);
        // Add language-based recognizers
        const erMaker = new EntityRecognizerMaker_1.EntityRecognizerMaker();
        nlp.addEntity(erMaker.makeDate(language, nlp_1.Entities.DATE));
        nlp.addEntity(erMaker.makeTime(language, nlp_1.Entities.TIME));
        nlp.addEntity(erMaker.makeDateTime(language, nlp_1.Entities.DATE_TIME));
        // nlp.addEntity( erMaker.makeTimePeriod( language, Entities.TIME_PERIOD ) );
        // nlp.addEntity( erMaker.makeYearOf( language, Entities.YEAR_OF ) );
        // Train with examples that include the added entities
        const opt = this.documentTrainingOptions();
        for (const ex of data.examples) {
            for (const sentence of ex.sentences) {
                nlp.addDocument(sentence, ex.intent, opt);
            }
        }
    }
    /**
     * Returns true if the NLP is trained for a certain language.
     *
     * @param language Language
     */
    isTrained(language) {
        if ((!this._nlpMap[language])) {
            return false;
        }
        return this._nlpMap[language].isTrained;
    }
    /**
     * Recognizes a sentence.
     *
     * @param language Language to be used in the recognition.
     * @param sentence Sentence to be recognized.
     * @param entityFilter Filters the entity to be recognized. Defaults to '*' which means "all" .
     */
    recognize(language, sentence, entityFilter = '*') {
        let nlp;
        if (!this._nlpMap[language]) {
            // Creates an untrained NLP
            this._nlpMap[language] = { nlp: this.createNLP(), isTrained: false };
        }
        nlp = this._nlpMap[language].nlp;
        let method = '*' == entityFilter || !entityFilter ? 'anyEntity' : entityFilter; // | "default"
        let r = nlp.test(sentence, method);
        // console.log(
        //     'Sentence  :', sentence, "\n",
        //     'Recognized:', r.text
        // );
        return r;
    }
    // -------------------------------------------------------------------------
    // FOR TESTING PURPOSES
    getInternalClock() {
        return Bravey.Clock.getValue();
    }
    setInternalClock(clockOrZone) {
        Bravey.Clock.setValue(clockOrZone);
    }
    resetInternalClock() {
        Bravey.Clock.resetValue();
    }
    /**
     * Creates a fixed clock
     *
     * @param temporal A LocalTime or LocalDate for example
     */
    createFixedClockFromNow() {
        return core_1.Clock.fixed(core_1.Instant.now(), // Instant.parse( "2018-08-19T16:02:42.00Z" ),
        core_1.ZoneId.systemDefault());
    }
    // -------------------------------------------------------------------------
    createNLP() {
        return this._useFuzzyProcessor ? new Bravey.Nlp.Fuzzy() : new Bravey.Nlp.Sequential();
    }
    documentTrainingOptions() {
        return { fromTaggedSentence: true, expandIntent: true };
    }
    /**
     * Adds default entities to the given entities array.
     *
     * @param entities Entities in which the default entities will be added.
     */
    addDefaultEntitiesTo(entities) {
        for (let entityName of this._additionalEntities) {
            entities.push({ id: entityName, entity: entityName });
        }
    }
    /**
     * Add default recognizers to the given processor.
     * @param nlp Processor
     */
    addDefaultRecognizersTo(nlp) {
        for (let rec of this._additionalRecognizers) {
            nlp.addEntity(rec);
        }
    }
}
exports.NLP = NLP;
