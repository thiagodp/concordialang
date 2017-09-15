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

    constructor( fuzzyRecognizer: boolean = true ) {
        this._recognizer = fuzzyRecognizer
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

        // Add intents
        for ( let intent of data.intents ) {
            // Add the intent with its entities
            nlp.addIntent( intent.name,
                intent.entities.map( e => { return { id: e.name, name: e.name }; } ) );

            // Create a string entity recognizer, ...
            let entityRec = new Bravey.StringEntityRecognizer( intent.name );
            // ...add some samples that match it, ...
            for ( let m of intent.matches ) {
                entityRec.addMatch( m.entityId, m.sampleText );
            }
            // then add it to the nlp
            nlp.addEntity( entityRec );
        }

        // Train with examples that include the added entities
        let opt = this.documentTrainingOptions();
        for ( let doc of data.documents ) {
            nlp.addDocument( doc.sentence, doc.entityId, opt);
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