"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReservedTags_1 = require("../req/ReservedTags");
const SyntaticException_1 = require("../req/SyntaticException");
const TagCollector_1 = require("./TagCollector");
/**
 * UI element parser.
 *
 * @author Thiago Delgado Pinto
 */
class UIElementParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        const GLOBAL_TAG_NAME = ReservedTags_1.ReservedTags.GLOBAL;
        // Adds backward tags
        if (!node.tags) {
            node.tags = [];
        }
        (new TagCollector_1.TagCollector()).addBackwardTags(it, node.tags);
        // Checks for a "global" tag
        const hasGlobalTag = node.tags.length > 0
            && node.tags.filter(tag => tag.name.toLowerCase() == GLOBAL_TAG_NAME).length > 0;
        let owner = hasGlobalTag ? context.doc : context.doc.feature;
        // Adjust the context
        context.resetInValues();
        context.currentUIElement = node;
        // Checks the structure
        if (owner && !owner.uiElements) {
            owner.uiElements = [];
        }
        // If it is NOT global, a feature must have been declared
        if (!hasGlobalTag && !context.doc.feature) {
            let e = new SyntaticException_1.SyntaticException('A non-global UI Element must be declared after a Feature.', node.location);
            errors.push(e);
            return false;
        }
        // Adds the node
        if (owner) {
            owner.uiElements.push(node);
        }
        return true;
    }
}
exports.UIElementParser = UIElementParser;
//# sourceMappingURL=UIElementParser.js.map