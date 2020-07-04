"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIPropertyReferenceExtractor = void 0;
const cloneRegExp = require("clone-regexp");
const nlp_1 = require("../nlp");
const UIPropertyReference_1 = require("../ast/UIPropertyReference");
const Symbols_1 = require("../req/Symbols");
/**
 * Extracts references to UIProperties.
 */
class UIPropertyReferenceExtractor {
    /**
     * Extracts references from a NLP result.
     *
     * @param nlpResult Result of a NLP
     * @param line Line of a text file. Optional, defaults to 1.
     */
    extractReferences(entities, line = 1) {
        //return entities.map( e => this.extractFromEntity( e, line ) ).filter( r => !! r );
        let references = [];
        for (let e of entities || []) {
            let ref = this.extractFromEntity(e, line);
            if (!ref) {
                continue;
            }
            references.push(ref);
        }
        return references;
    }
    /**
     * Extracts a reference from an entity. Returns `null` whether the entity is not a UI Property Reference.
     *
     * @param nlpEntity NLP Entity
     * @param line Line of a text file. Optional, defaults to 1.
     */
    extractFromEntity(nlpEntity, line = 1) {
        if (nlpEntity.entity != nlp_1.Entities.UI_PROPERTY_REF) {
            return null;
        }
        return this.makeReferenceFromString(nlpEntity.value, { column: nlpEntity.position, line: line });
    }
    /**
     * Extracts references from a Concordia value.
     *
     * @param text Text containing one or more references.
     * @param line Line. Optional, defaults to 1.
     */
    extractReferencesFromValue(text, line = 1) {
        let regex = cloneRegExp(nlp_1.UI_PROPERTY_REF_REGEX);
        let references = [];
        let result;
        while ((result = regex.exec(text)) !== null) {
            const value = result[0] || '';
            let ref = this.makeReferenceFromString(value, { column: result.index, line: line });
            references.push(ref);
        }
        return references;
    }
    /**
     * Creates a UIE property reference from a string.
     *
     * @param reference String with the reference, e.g., "{Feature 1:Age|value}"
     * @param location Location
     */
    makeReferenceFromString(reference, location) {
        let value = reference;
        if (value.indexOf(Symbols_1.Symbols.UI_ELEMENT_PREFIX) >= 0) {
            value = value.substring(1, value.length - 1).trim(); // exclude { and } and trim
        }
        const [uieName, prop] = value.split(Symbols_1.Symbols.UI_PROPERTY_REF_SEPARATOR);
        let ref = new UIPropertyReference_1.UIPropertyReference();
        ref.uiElementName = uieName.trim();
        ref.property = prop.trim();
        ref.content = ref.uiElementName + Symbols_1.Symbols.UI_PROPERTY_REF_SEPARATOR + ref.property;
        ref.location = location;
        return ref;
    }
}
exports.UIPropertyReferenceExtractor = UIPropertyReferenceExtractor;
