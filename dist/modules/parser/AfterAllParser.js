"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntaticException_1 = require("../req/SyntaticException");
const TypeChecking_1 = require("../util/TypeChecking");
/**
 * AfterAll parser
 *
 * @author Thiago Delgado Pinto
 */
class AfterAllParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Check whether a similar node was already declared
        if (TypeChecking_1.isDefined(context.doc.afterAll)) {
            let e = new SyntaticException_1.SyntaticException('Event already declared: After All', node.location);
            errors.push(e);
            return false;
        }
        // Adjust the context
        context.resetInValues();
        context.inAfterAll = true;
        // Adjust the document
        context.doc.afterAll = node;
        return true;
    }
}
exports.AfterAllParser = AfterAllParser;
