"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepOtherwiseParser = void 0;
const NodeTypes_1 = require("../req/NodeTypes");
const SyntacticException_1 = require("./SyntacticException");
/**
 * Step Otherwise node parser.
 *
 * @author Thiago Delgado Pinto
 */
class StepOtherwiseParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks prior nodes
        const allowedPriorNodes = [
            NodeTypes_1.NodeTypes.UI_PROPERTY,
            NodeTypes_1.NodeTypes.STEP_OTHERWISE,
            NodeTypes_1.NodeTypes.STEP_AND
        ];
        if (!it.hasPrior() || allowedPriorNodes.indexOf(it.spyPrior().nodeType) < 0) {
            let e = new SyntacticException_1.SyntacticException('The "' + node.nodeType + '" clause must be declared after a UI Element Property.', node.location);
            errors.push(e);
            return false;
        }
        let prior = it.spyPrior();
        // Checks the structure
        if (!prior.otherwiseSentences) {
            prior.otherwiseSentences = [];
        }
        // Adds the node
        prior.otherwiseSentences.push(node);
        return true;
    }
}
exports.StepOtherwiseParser = StepOtherwiseParser;
