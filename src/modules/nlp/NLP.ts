import { Entities } from './Entities';
import { NLPTrainingData } from "./NLPTrainingData";
import Bravey = require('../../lib/bravey'); // .js file

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

        // Add an entity named "value" and its recognizer
        this._additionalEntities.push( Entities.VALUE );
        this._additionalRecognizers.push( this.makeValueEntityRecognizer( Entities.VALUE ) );

        // Add an entity named "element" and its recognizer
        this._additionalEntities.push( Entities.ELEMENT );
        this._additionalRecognizers.push( this.makeElementEntityRecognizer( Entities.ELEMENT ) );
        
        // Add an entity named "number" and its recognizer
        this._additionalEntities.push( Entities.NUMBER );
        this._additionalRecognizers.push( this.makeNumberEntityRecognizer( Entities.NUMBER ) );

        // Add an entity named "query" and its recognizer
        this._additionalEntities.push( Entities.QUERY );
        this._additionalRecognizers.push( this.makeQueryEntityRecognizer( Entities.QUERY ) );
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
                let entityRec = new Bravey.StringEntityRecognizer( e.name );
                for ( let m of e.matches ) {
                    for ( let sample of m.samples ) {
                        entityRec.addMatch( m.id, sample );
                    }
                }
                nlp.addEntity( entityRec );
            }
        }

        // Add other needed recognizers
        this.addDefaultRecognizersTo( nlp );

        // Train with examples that include the added entities
        let opt = this.documentTrainingOptions();
        for ( let ex of data.examples ) {
            for ( let sentence of ex.sentences ) {
                nlp.addDocument( sentence, ex.entity, opt );
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
     * Recognizes a sentece.
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
        return nlp.test( sentence, method );
    }

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

    /**
     * Creates a recognizer for values between quotes.
     * 
     * Example: I fill "name" with "Bob"
     * --> The words "name" and "Bob" are recognized (without quotes).
     * 
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    private makeValueEntityRecognizer( entityName: string ): any {

        let valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );

        valueRec.addMatch( new RegExp( '"[^"\r\n]*"', "gi" ),
            function( match ) {
                //console.log( 'match: ' ); console.log( match );
                return match.toString().replace( /['"]+/g, '' );
            },
            100 ); // the number is the priority

        return valueRec;
    }

    /**
     * Creates a recognizer for values between < and >.
     * 
     * Example: I fill <Name> with "Bob"
     * --> The word "Name" is recognized (without quotes).
     * 
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    private makeElementEntityRecognizer( entityName: string ): any {

        var valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );

        valueRec.addMatch( new RegExp( '<[^<\r\n]*>', "gi" ),
            function( match ) {
                //console.log( 'match: ' ); console.log( match );
                return match.toString().replace( '<', '' ).replace( '>', '' );
            },
            100 ); // the number is the priority

        return valueRec;
    }

    /**
     * Creates a recognizer for a number.
     * 
     * Example: I fill "name" with -10.33
     * --> The value -10.33 is recognized.
     * 
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    private makeNumberEntityRecognizer( entityName: string ): any {

        var valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        
        valueRec.addMatch( new RegExp( '(-?[0-9]+(?:.[0-9]+)?)', "gi" ),
            function( match ) {
                //console.log( 'match: ' ); console.log( match );
                return match[ 0 ].toString().trim();
            },
            100 ); // the number is the priority

        return valueRec;
    }

    /**
     * Creates a recognizer for values between apostrophes.
     * 
     * Example: - value comes from the query 'SELECT * FROM users'
     * --> The value "SELECT * FROM users" (without quotes) is recognized.
     * 
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    private makeQueryEntityRecognizer( entityName: string ): any {
        
        let valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );

        valueRec.addMatch( new RegExp( "'[^']*'", "gi" ),
            function( match ) {
                //console.log( 'match: ' ); console.log( match );
                return match.toString().replace( /['"]+/g, '' );
            },
            100 ); // the number is the priority

        return valueRec;
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


/**
 * NLP Result. Currently it has the same structure of Bravey's NlpResult.
 * 
 * @author Thiago Delgado Pinto
 */
export interface NLPResult {
    entities: Array< NLPEntity >; // The ordered list of found entities.
    entitiesIndex: Array< number >; // An map version of entities, with key as entity ID and value as entity value.
    intent: string; // The matched intent.
    score: number; // The score of the matched sentence intent.
}

/**
 * NLP Entity. Currently it has the same structure of Bravey's Entity.
 * 
 * @author Thiago Delgado Pinto
 */
export interface NLPEntity {
    entity: string; // The entity type.
    string: string; // The raw text representing the entity.
    position: number; // The entity position in a sentence.
    value: any; // The entity logic value.
    priority: number; // The entity relative priority.    
}