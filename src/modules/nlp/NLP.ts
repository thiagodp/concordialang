import { NLPTrainingData } from "./NLPTrainingData";
import Bravey = require( '../../lib/bravey' ); // .js file

/**
 * Natural Language Processor
 * 
 * @author Thiago Delgado Pinto
 */
export class NLP {

    private _trained: boolean = false;
    private _recognizer;

    constructor( useFuzzyRecognizer: boolean = true ) {
        this._recognizer = useFuzzyRecognizer
            ? new Bravey.Nlp.Fuzzy() : new Bravey.Nlp.Sequential();
    }

    /**
     * Train the recognizer.
     * 
     * @param data Data to be used in the training.
     */
    train( data: NLPTrainingData ): void {

        this._trained = true;
        let nlp = this._recognizer;

        // Add intents and their recognizers
        for ( let intent of data.intents ) {

            // Add the intent with its entities
            nlp.addIntent( intent.name,
                intent.entities.map( e => { return { id: e.name, name: e.name }; } ) );

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
        return this._recognizer.test( sentence );
    }

    private documentTrainingOptions(): Object {
        return { fromTaggedSentence: true, expandIntent: true };
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