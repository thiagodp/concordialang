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