"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AfterFeatureParser = void 0;
const TypeChecking_1 = require("../util/TypeChecking");
const SyntacticException_1 = require("./SyntacticException");
/**
 * AfterFeature parser
 *
 * @author Thiago Delgado Pinto
 */
class AfterFeatureParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Check whether a Feature was declared
        if (!context.doc.feature) {
            let e = new SyntacticException_1.SyntacticException('The event After Feature must be declared after a Feature', node.location);
            errors.push(e);
            return false;
        }
        // Check whether a similar node was already declared
        if (TypeChecking_1.isDefined(context.doc.afterFeature)) {
            let e = new SyntacticException_1.SyntacticException('Event already declared: After Feature', node.location);
            errors.push(e);
            return false;
        }
        // Adjust the context
        context.resetInValues();
        context.inAfterFeature = true;
        // Adjust the document
        context.doc.afterFeature = node;
        return true;
    }
}
exports.AfterFeatureParser = AfterFeatureParser;
