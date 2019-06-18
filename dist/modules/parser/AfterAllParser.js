"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntacticException_1 = require("../req/SyntacticException");
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
            let e = new SyntacticException_1.SyntacticException('Event already declared: After All', node.location);
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
