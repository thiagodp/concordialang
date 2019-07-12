import { Location } from 'concordialang-types';

import { Entities, NLPEntity } from "../nlp";
import { UIPropertyReference } from '../ast/UIPropertyReference';
import { Symbols } from '../req/Symbols';

/**
 * Extracts references to UIProperties.
 */
export class UIPropertyReferenceExtractor {

    /**
     * Extracts references from a NLP result.
     *
     * @param nlpResult Result of a NLP
     * @param line Line of a text file. Optional, defaults to 1.
     */
    extractReferences(
        entities: NLPEntity[],
        line: number = 1
    ): UIPropertyReference[] {
        //return entities.map( e => this.extractFromEntity( e, line ) ).filter( r => !! r );
        let references: UIPropertyReference[] = [];
        for ( let e of entities || [] ) {
            let ref = this.extractFromEntity( e, line );
            if ( ! ref ) {
                continue;
            }
            references.push( ref );
        }
        return references;
    }


    /**
     * Extracts a reference from an entity. Returns `null` whether the entity is not a UI Property Reference.
     *
     * @param nlpEntity NLP Entity
     * @param line Line of a text file. Optional, defaults to 1.
     */
    extractFromEntity(
        nlpEntity: NLPEntity,
        line: number = 1
    ): UIPropertyReference {

        if ( nlpEntity.entity != Entities.UI_PROPERTY_REF ) {
            return null;
        }

        const [ uieName, prop ] = nlpEntity.value.split( Symbols.UI_PROPERTY_REF_SEPARATOR );

        let ref = new UIPropertyReference();
        ref.uiElementName = uieName.trim();
        ref.property = prop.trim();
        ref.content = ref.uiElementName + Symbols.UI_PROPERTY_REF_SEPARATOR + ref.property;

        ref.location = { column: nlpEntity.position, line: line } as Location;

        return ref;
    }

}