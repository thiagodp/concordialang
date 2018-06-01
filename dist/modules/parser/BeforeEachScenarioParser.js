"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntaticException_1 = require("../req/SyntaticException");
const TypeChecking_1 = require("../util/TypeChecking");
/**
 * BeforeEachScenario parser
 *
 * @author Thiago Delgado Pinto
 */
class BeforeEachScenarioParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Check whether a Feature was declared
        if (!context.doc.feature) {
            let e = new SyntaticException_1.SyntaticException('The event Before Each Scenario must be declared after a Feature', node.location);
            errors.push(e);
            return false;
        }
        // Check whether a similar node was already declared
        if (TypeChecking_1.isDefined(context.doc.beforeEachScenario)) {
            let e = new SyntaticException_1.SyntaticException('Event already declared: Before Each Scenario', node.location);
            errors.push(e);
            return false;
        }
        // Adjust the context
        context.resetInValues();
        context.inBeforeEachScenario = true;
        // Adjust the document
        context.doc.beforeEachScenario = node;
        return true;
    }
}
exports.BeforeEachScenarioParser = BeforeEachScenarioParser;
