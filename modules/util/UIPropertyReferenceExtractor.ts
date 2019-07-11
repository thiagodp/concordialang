import { Location } from 'concordialang-types';

import { Entities, NLPResult } from "../nlp";
import { UIPropertyReference } from '../ast/UIPropertyReference';
import { Symbols } from '../req/Symbols';

/**
 * Extracts references to UIProperties.
 */
export class UIPropertyReferenceExtractor {

    /**
     * Extract references from a NLP result.
     *
     * @param nlpResult Result of a NLP
     * @param line Line of a text file. Optional, defaults to 1.
     */
    extractReferences(
        nlpResult: NLPResult,
        line: number = 1
    ): UIPropertyReference[] {

        let references: UIPropertyReference[] = [];

        for ( let e of nlpResult.entities ) {

            if ( e.entity != Entities.UI_PROPERTY_REF ) {
                continue;
            }

            const [ uieName, prop ] = e.value.split( Symbols.UI_PROPERTY_REF_SEPARATOR );

            let ref = new UIPropertyReference();
            ref.content = e.value;
            ref.uiElementName = uieName;
            ref.property = prop;
            ref.location = { column: e.position, line: line } as Location;
            // no value yet

            references.push( ref );
        }

        return references;
    }

}