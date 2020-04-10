import * as cloneRegExp from 'clone-regexp';
import { Location } from 'concordialang-types';
import { UIPropertyReference } from '../ast/UIPropertyReference';
import { Entities, NLPEntity, UI_PROPERTY_REF_REGEX } from "../nlp";
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

        return this.makeReferenceFromString(
            nlpEntity.value,
            { column: nlpEntity.position, line: line } as Location
        );
    }

    /**
     * Extracts references from a Concordia value.
     *
     * @param text Text containing one or more references.
     * @param line Line. Optional, defaults to 1.
     */
    extractReferencesFromValue(
        text: string,
        line: number = 1
    ): UIPropertyReference[] {
        let regex: RegExp = cloneRegExp( UI_PROPERTY_REF_REGEX );
        let references: UIPropertyReference[] = [];
        let result: RegExpExecArray;
        while ( ( result = regex.exec( text ) ) !== null ) {
            const value = result[ 0 ] || '';
            let ref = this.makeReferenceFromString(
                value,
                { column: result.index, line: line } as Location
            );
            references.push( ref );
        }
        return references;
    }


    /**
     * Creates a UIE property reference from a string.
     *
     * @param reference String with the reference, e.g., "{Feature 1:Age|value}"
     * @param location Location
     */
    makeReferenceFromString( reference: string, location: Location ): UIPropertyReference {
        let value = reference;
        if ( value.indexOf( Symbols.UI_ELEMENT_PREFIX ) >= 0 ) {
            value = value.substring( 1, value.length - 1 ).trim(); // exclude { and } and trim
        }
        const [ uieName, prop ] = value.split( Symbols.UI_PROPERTY_REF_SEPARATOR );
        let ref = new UIPropertyReference();
        ref.uiElementName = uieName.trim();
        ref.property = prop.trim();
        ref.content = ref.uiElementName + Symbols.UI_PROPERTY_REF_SEPARATOR + ref.property;
        ref.location = location;
        return ref;
    }
}