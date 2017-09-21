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
    }

    /**
     * Train the recognizer.
     * 
     * @param data Data to be used in the training.
     */
    train( data: NLPTrainingData ): void {

        this._trained = true;
        let nlp = this._nlp;

        // Add intents and their recognizers
        for ( let intent of data.intents ) {

            let entities = intent.entities.map( e => { return { id: e.name, name: e.name }; } );
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

    isTrained(): boolean {
        return this._trained;
    }

    recognize( sentence: string ): NLPResult {
        return this._nlp.test( sentence );
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
            entities.push( { id: entityName, name: entityName } );
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
     * Example: I fill "name" with "Bob" --> "name" and "Bob" are recognized.
     * 
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    private makeValueEntityRecognizer( entityName: string = 'value' ): any {

        let valueRec = new Bravey.RegexEntityRecognizer( entityName );

        valueRec.addMatch( new RegExp( '"[^"\r\n]*"', "gi" ),
            function( match ) {
                //console.log( 'match: ' ); console.log( match );
                return match.toString().replace( /['"]+/g, '' );
            } );

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