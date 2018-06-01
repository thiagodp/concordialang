"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntaticException_1 = require("../req/SyntaticException");
const TypeChecking_1 = require("../util/TypeChecking");
/**
 * BeforeFeature parser
 *
 * @author Thiago Delgado Pinto
 */
class BeforeFeatureParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Check whether a Feature was declared
        if (!context.doc.feature) {
            let e = new SyntaticException_1.SyntaticException('The event Before Feature must be declared after a Feature', node.location);
            errors.push(e);
            return false;
        }
        // Check whether a similar node was already declared
        if (TypeChecking_1.isDefined(context.doc.beforeFeature)) {
            let e = new SyntaticException_1.SyntaticException('Event already declared: Before Feature', node.location);
            errors.push(e);
            return false;
        }
        // Adjust the context
        context.resetInValues();
        context.inBeforeFeature = true;
        // Adjust the document
        context.doc.beforeFeature = node;
        return true;
    }
}
exports.BeforeFeatureParser = BeforeFeatureParser;
