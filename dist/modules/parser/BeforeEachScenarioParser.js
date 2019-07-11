"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntacticException_1 = require("./SyntacticException");
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
            let e = new SyntacticException_1.SyntacticException('The event Before Each Scenario must be declared after a Feature', node.location);
            errors.push(e);
            return false;
        }
        // Check whether a similar node was already declared
        if (TypeChecking_1.isDefined(context.doc.beforeEachScenario)) {
            let e = new SyntacticException_1.SyntacticException('Event already declared: Before Each Scenario', node.location);
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
