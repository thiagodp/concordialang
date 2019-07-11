"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntacticException_1 = require("./SyntacticException");
const TypeChecking_1 = require("../util/TypeChecking");
/**
 * AfterEachScenario parser
 *
 * @author Thiago Delgado Pinto
 */
class AfterEachScenarioParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Check whether a Feature was declared
        if (!context.doc.feature) {
            let e = new SyntacticException_1.SyntacticException('The event After Each Scenario must be declared after a Feature', node.location);
            errors.push(e);
            return false;
        }
        // Check whether a similar node was already declared
        if (TypeChecking_1.isDefined(context.doc.afterEachScenario)) {
            let e = new SyntacticException_1.SyntacticException('Event already declared: After Each Scenario', node.location);
            errors.push(e);
            return false;
        }
        // Adjust the context
        context.resetInValues();
        context.inAfterEachScenario = true;
        // Adjust the document
        context.doc.afterEachScenario = node;
        return true;
    }
}
exports.AfterEachScenarioParser = AfterEachScenarioParser;
