/**
 * NLP Result. Currently it has the same structure of Bravey's NlpResult.
 * 
 * @author Thiago Delgado Pinto
 */
export interface NLPResult {

    // Number of found entities.
    found: number;    
    // Ordered list of found entities.
    entities: Array< NLPEntity >;
    // A mapped version of the entities, in which the key is the entity id and value is a NLPEntity.
    entitiesIndex: Map< string, NLPEntity >;
    // Matched intent.
    intent: string;
    // Score of the matched sentence intent. E.g., 0.8999999999999999
    score: number;
    // Sentence with recognized entities, E.g., "Hello {name}".
    text: string;

    // IGNORED Bravey ATTRIBUTES:
    //
    // exceedEntities: boolean;
    // extraEntities: boolean;
    // missingEntities: boolean;
    // sentences: Array< { string: string } | NLPEntity >

}

/**
 * NLP Entity. Currently it has the same structure of Bravey's Entity.
 * 
 * @author Thiago Delgado Pinto
 */
export interface NLPEntity {
    entity: string; //      Entity type.
    string: string; //      Raw text representing the entity.
    position: number; //    Entity position in a sentence.
    value: any; //          Entity logic value.
    priority: number; //    Entity relative priority.    
}