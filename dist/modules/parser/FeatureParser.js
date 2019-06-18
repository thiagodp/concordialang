"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntacticException_1 = require("../req/SyntacticException");
const TagCollector_1 = require("./TagCollector");
const TextCollector_1 = require("./TextCollector");
/**
 * Feature parser
 *
 * @author Thiago Delgado Pinto
 */
class FeatureParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks if it is already declared
        if (context.doc.feature) {
            let e = new SyntacticException_1.SyntacticException('Just one feature declaration is allowed.', node.location);
            errors.push(e);
            return false;
        }
        // Define the current feature
        context.doc.feature = node;
        // Checks the structure
        node.tags = node.tags || [];
        node.sentences = node.sentences || [];
        node.scenarios = node.scenarios || [];
        node.uiElements = node.uiElements || [];
        // Adjust the context
        context.resetInValues();
        context.inFeature = true;
        // Add backwards tags
        (new TagCollector_1.TagCollector()).addBackwardTags(it, node.tags); // does not touch the iterator
        // Add forward text sentences
        (new TextCollector_1.TextCollector()).addForwardTextNodes(it, node.sentences, true); // true == change iterator
        return true;
    }
}
exports.FeatureParser = FeatureParser;
