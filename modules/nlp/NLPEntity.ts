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