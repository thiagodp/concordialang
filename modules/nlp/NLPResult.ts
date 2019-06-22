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



export class NLPUtil {

    entitiesNamed( name: string, nlpResult: NLPResult ): NLPEntity[] {
        return nlpResult.entities.filter( e => name === e.entity );
    }

    hasEntityNamed( name: string, nlpResult: NLPResult ): boolean {
        return this.entitiesNamed( name, nlpResult ).length > 0;
    }

    /**
     * Returns true if the NLPResult has all the informed entity names.
     *
     * @param names
     * @param nlpResult
     */
    hasEntitiesNamed( names: string[], nlpResult: NLPResult ): boolean {
        return names.every( name => this.hasEntityNamed( name, nlpResult ) );
    }

    entityNamed( name: string, nlpResult: NLPResult ): NLPEntity | null {
        return nlpResult.entities.find( e => name === e.entity ) || null;
    }

    valuesOfEntitiesNamed( name: string, nlpResult: NLPResult ): string[] {
        return nlpResult.entities.filter( e => name === e.entity ).map( e => e.value );
    }

}