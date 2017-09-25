import { NLPTrainingData } from "./NLPTrainingData";
import Bravey = require( '../../lib/bravey' ); // .js file

/**
 * Natural Language Processor
 * 
 * @author Thiago Delgado Pinto
 */
export class NLP {

    private _trained: boolean = false;
    private _nlp: any = {}; // Bravey.NLP.XXX
    private _additionalEntities: string[] = [];
    private _additionalRecognizers: Object[] = [];

    constructor( useFuzzyProcessor: boolean = true ) {

        this._nlp = useFuzzyProcessor
            ? new Bravey.Nlp.Fuzzy() : new Bravey.Nlp.Sequential();

        // Add an entity named "value" and its recognizer
        this._additionalEntities.push( 'value' );
        this._additionalRecognizers.push( this.makeValueEntityRecognizer( 'value' ) );

        // Add an entity named "element" and its recognizer
        this._additionalEntities.push( 'element' );
        this._additionalRecognizers.push( this.makeElementEntityRecognizer( 'element' ) );        
    }

    /**
     * Train the recognizer.
     * 
     * @param data Data to be used in the training.
     */
    train( data: NLPTrainingData, intentNameFilter: string = undefined ): void {

        this._trained = true;

        // Add intents and their recognizers
        for ( let intent of data.intents ) {

            // Ignores the intent if it is equal to the filter (if defined)
            if ( intentNameFilter && intentNameFilter != intent.name ) {
                continue; // ignore the intent
            }

            let entities = intent.entities.map( e => { return { id: e.name, entity: e.name }; } );
            this.addDefaultEntitiesTo( entities );

            // Add the intent with its entities
            this._nlp.addIntent( intent.name, entities );

            // Add entity recognizers with matches. Each match have sample values, that 
            // are added to the recognizer.
            for ( let e of intent.entities ) {
                let entityRec = new Bravey.StringEntityRecognizer( e.name );
                for ( let m of e.matches ) {
                    for ( let sample of m.samples ) {
                        entityRec.addMatch( m.id, sample );
                    }
                }
                this._nlp.addEntity( entityRec );
            }
        }

        // Add other needed recognizers
        this.addDefaultRecognizersTo( this._nlp );

        // Train with examples that include the added entities
        let opt = this.documentTrainingOptions();
        for ( let ex of data.examples ) {
            for ( let sentence of ex.sentences ) {
                this._nlp.addDocument( sentence, ex.entity, opt );
            }
        }
    }

    isTrained(): boolean {
        return this._trained;
    }

    recognize( sentence: string ): NLPResult | null {
        let method = 'anyEntity'; // | "default"
        return this._nlp.test( sentence, method );
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
    private makeValueEntityRecognizer( entityName: string = 'value' ): any {

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
    private makeElementEntityRecognizer( entityName: string = 'element' ): any {

        var valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );

        valueRec.addMatch( new RegExp( '<[^<\r\n]*>', "gi" ),
            function( match ) {
                //console.log( 'match: ' ); console.log( match );
                return match.toString().replace( '<', '' ).replace( '>', '' );
            },
            100 ); // the number is the priority

        return valueRec;
    }    

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