"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        const [uieName, prop] = nlpEntity.value.split(Symbols_1.Symbols.UI_PROPERTY_REF_SEPARATOR);
        let ref = new UIPropertyReference_1.UIPropertyReference();
        ref.uiElementName = uieName.trim();
        ref.property = prop.trim();
        ref.content = ref.uiElementName + Symbols_1.Symbols.UI_PROPERTY_REF_SEPARATOR + ref.property;
        ref.location = { column: nlpEntity.position, line: line };
        return ref;
    }
}
exports.UIPropertyReferenceExtractor = UIPropertyReferenceExtractor;
