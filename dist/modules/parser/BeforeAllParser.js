"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntacticException_1 = require("./SyntacticException");
const TypeChecking_1 = require("../util/TypeChecking");
/**
 * BeforeAll parser
 *
 * @author Thiago Delgado Pinto
 */
class BeforeAllParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Check whether a similar node was already declared
        if (TypeChecking_1.isDefined(context.doc.beforeAll)) {
            let e = new SyntacticException_1.SyntacticException('Event already declared: Before All', node.location);
            errors.push(e);
            return false;
        }
        // Adjust the context
        context.resetInValues();
        context.inBeforeAll = true;
        // Adjust the document
        context.doc.beforeAll = node;
        return true;
    }
}
exports.BeforeAllParser = BeforeAllParser;
