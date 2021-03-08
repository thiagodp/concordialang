import { Clock, Instant, ZoneId } from '@js-joda/core';

import Bravey = require('../../lib/bravey');
import { Entities } from '../nlp/Entities';
import { NLPResult } from '../nlp/NLPResult';
import { NLPTrainingData } from '../nlp/NLPTrainingData';
import { EntityRecognizerMaker } from './EntityRecognizerMaker';

/**
 * Natural Language Processor
 *
 * @author Thiago Delgado Pinto
 */
export class NLP {

    private _nlpMap: any = {}; // Maps language => Bravey.NLP
    private _additionalEntities: string[] = [];
    private _additionalRecognizers: Object[] = [];

    constructor( private _useFuzzyProcessor: boolean = true ) {

        const erMaker = new EntityRecognizerMaker();

        // Add an entity named "value" and its recognizer
        this._additionalEntities.push( Entities.VALUE );
        this._additionalRecognizers.push( erMaker.makeValue( Entities.VALUE ) );

        // Add an entity named "ui_element" and its recognizer
        this._additionalEntities.push( Entities.UI_ELEMENT_REF );
        this._additionalRecognizers.push( erMaker.makeUIElementReference( Entities.UI_ELEMENT_REF ) );

        // Add an entity named "ui_property_ref" and its recognizer
        this._additionalEntities.push( Entities.UI_PROPERTY_REF );
        this._additionalRecognizers.push( erMaker.makeUIPropertyReference( Entities.UI_PROPERTY_REF ) );

        // Add an entity named "ui_element_literal" and its recognizer
        this._additionalEntities.push( Entities.UI_LITERAL );
        this._additionalRecognizers.push( erMaker.makeUILiteral( Entities.UI_LITERAL ) );

        // Add an entity named "number" and its recognizer
        this._additionalEntities.push( Entities.NUMBER );
        this._additionalRecognizers.push( erMaker.makeNumber( Entities.NUMBER ) );

        // Add an entity named "query" and its recognizer
        this._additionalEntities.push( Entities.QUERY );
        this._additionalRecognizers.push( erMaker.makeQuery( Entities.QUERY ) );

        // Add an entity named "constant" and its recognizer
        this._additionalEntities.push( Entities.CONSTANT );
        this._additionalRecognizers.push( erMaker.makeConstant( Entities.CONSTANT ) );

        // Add an entity named "value_list" and its recognizer
        this._additionalEntities.push( Entities.VALUE_LIST );
        this._additionalRecognizers.push( erMaker.makeValueList( Entities.VALUE_LIST ) );

        // Add an entity named "state" and its recognizer
        this._additionalEntities.push( Entities.STATE );
        this._additionalRecognizers.push( erMaker.makeState( Entities.STATE ) );

        // Add an entity named "command" and its recognizer
        this._additionalEntities.push( Entities.COMMAND );
        this._additionalRecognizers.push( erMaker.makeCommand( Entities.COMMAND ) );

        // Language-based entities
        this._additionalEntities.push( Entities.DATE );
        this._additionalEntities.push( Entities.TIME );
        this._additionalEntities.push( Entities.DATE_TIME );
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
    public train( language: string, data: NLPTrainingData, intentNameFilter: string = undefined ): void {

        if ( ! this._nlpMap[ language ] ) {
            this._nlpMap[ language ] = { nlp: this.createNLP(), isTrained: true } as MappedNLP;
        } else {
            this._nlpMap[ language ].isTrained = true;
        }
        let nlp = this._nlpMap[ language ].nlp;

        // Add intents and their recognizers
        for ( let intent of data.intents ) {

            // Ignores the intent if it is equal to the filter (if defined)
            if ( intentNameFilter && intentNameFilter != intent.name ) {
                continue; // ignore the intent
            }

            let entities = intent.entities.map( e => { return { id: e.name, entity: e.name }; } );
            this.addDefaultEntitiesTo( entities );

            // Add the intent with its entities
            nlp.addIntent( intent.name, entities );

            // Add entity recognizers with matches. Each match have sample values, that
            // are added to the recognizer.
            for ( let e of intent.entities ) {
                let priority = undefined;
                if ( data.priorities && data.priorities[ intent.name ] && data.priorities[ intent.name ][ e.name ] ) {
                    priority = data.priorities[ intent.name ][ e.name ];
                }
                let entityRec = new Bravey.StringEntityRecognizer( e.name, priority );
                for ( let m of e.matches ) {
                    for ( let sample of m.samples ) {
                        entityRec.addMatch( m.id, sample );
                    }
                }
                nlp.addEntity( entityRec );
            }
        }

        // Add default recognizers
        this.addDefaultRecognizersTo( nlp );

        // Add language-based recognizers
        const erMaker = new EntityRecognizerMaker();
        nlp.addEntity( erMaker.makeDate( language, Entities.DATE ) );
        nlp.addEntity( erMaker.makeTime( language, Entities.TIME ) );
        nlp.addEntity( erMaker.makeDateTime( language, Entities.DATE_TIME ) );
        // nlp.addEntity( erMaker.makeTimePeriod( language, Entities.TIME_PERIOD ) );
        // nlp.addEntity( erMaker.makeYearOf( language, Entities.YEAR_OF ) );

        // Train with examples that include the added entities
        const opt = this.documentTrainingOptions();
        for ( const ex of data.examples ) {
            for ( const sentence of ex.sentences ) {
                nlp.addDocument( sentence, ex.intent, opt );
            }
        }
    }

    /**
     * Returns true if the NLP is trained for a certain language.
     *
     * @param language Language
     */
    public isTrained( language: string ): boolean {
        if ( ( ! this._nlpMap[ language ] ) ) {
            return false;
        }
        return this._nlpMap[ language ].isTrained;
    }

    /**
     * Recognizes a sentence.
     *
     * @param language Language to be used in the recognition.
     * @param sentence Sentence to be recognized.
     * @param entityFilter Filters the entity to be recognized. Defaults to '*' which means "all" .
     */
    public recognize( language: string, sentence: string, entityFilter: string = '*' ): NLPResult | null {
        let nlp;
        if ( ! this._nlpMap[ language ] ) {
            // Creates an untrained NLP
            this._nlpMap[ language ] = { nlp: this.createNLP(), isTrained: false } as MappedNLP;
        }
        nlp = this._nlpMap[ language ].nlp;
        let method = '*' == entityFilter || ! entityFilter ? 'anyEntity' : entityFilter; // | "default"
        let r = nlp.test( sentence, method );
        // console.log(
        //     'Sentence  :', sentence, "\n",
        //     'Recognized:', r.text
        // );
        return r;
    }

    // -------------------------------------------------------------------------
    // FOR TESTING PURPOSES

    public getInternalClock(): Clock | ZoneId {
        return Bravey.Clock.getValue();
    }

    public setInternalClock( clockOrZone?: Clock | ZoneId ): void {
        Bravey.Clock.setValue( clockOrZone );
    }

    public resetInternalClock(): void {
        Bravey.Clock.resetValue();
    }

    /**
     * Creates a fixed clock
     *
     * @param temporal A LocalTime or LocalDate for example
     */
    public createFixedClockFromNow(): Clock {
        return Clock.fixed(
            Instant.now(), // Instant.parse( "2018-08-19T16:02:42.00Z" ),
            ZoneId.systemDefault()
            );
    }

    // -------------------------------------------------------------------------


    private createNLP(): any {
        return this._useFuzzyProcessor ? new Bravey.Nlp.Fuzzy() : new Bravey.Nlp.Sequential()
    }

    private documentTrainingOptions(): Object {
        return { fromTaggedSentence: true, expandIntent: true };
    }

    /**
     * Adds default entities to the given entities array.
     *
     * @param entities Entities in which the default entities will be added.
     */
    private addDefaultEntitiesTo( entities: Object[] ): void {
        for ( let entityName of this._additionalEntities ) {
            entities.push( { id: entityName, entity: entityName } );
        }
    }

    /**
     * Add default recognizers to the given processor.
     * @param nlp Processor
     */
    private addDefaultRecognizersTo( nlp: any ): void {
        for ( let rec of this._additionalRecognizers ) {
            nlp.addEntity( rec );
        }
    }

}

/**
 * Mapped NLP
 *
 * @author Thiago Delgado Pinto
 */
interface MappedNLP {
    nlp: any;
    isTrained: boolean;
}
