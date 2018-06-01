"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntaticException_1 = require("../req/SyntaticException");
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
            let e = new SyntaticException_1.SyntaticException('Event already declared: Before All', node.location);
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
