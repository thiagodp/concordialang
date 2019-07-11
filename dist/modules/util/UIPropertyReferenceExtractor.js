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
     * Extract references from a NLP result.
     *
     * @param nlpResult Result of a NLP
     * @param line Line of a text file. Optional, defaults to 1.
     */
    extractReferences(nlpResult, line = 1) {
        let references = [];
        for (let e of nlpResult.entities) {
            if (e.entity != nlp_1.Entities.UI_PROPERTY_REF) {
                continue;
            }
            const [uieName, prop] = e.value.split(Symbols_1.Symbols.UI_PROPERTY_REF_SEPARATOR);
            let ref = new UIPropertyReference_1.UIPropertyReference();
            ref.content = e.value;
            ref.uiElementName = uieName;
            ref.property = prop;
            ref.location = { column: e.position, line: line };
            // no value yet
            references.push(ref);
        }
        return references;
    }
}
exports.UIPropertyReferenceExtractor = UIPropertyReferenceExtractor;
