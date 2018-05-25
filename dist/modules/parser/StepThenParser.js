"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
const SyntaticException_1 = require("../req/SyntaticException");
/**
 * Step Then node parser.
 *
 * @author Thiago Delgado Pinto
 */
class StepThenParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks prior nodes
        const allowedPriorNodes = [
            NodeTypes_1.NodeTypes.STEP_GIVEN,
            NodeTypes_1.NodeTypes.STEP_WHEN,
            NodeTypes_1.NodeTypes.STEP_AND
        ];
        if (!it.hasPrior() || allowedPriorNodes.indexOf(it.spyPrior().nodeType) < 0) {
            let e = new SyntaticException_1.SyntaticException('The "' + node.nodeType + '" clause must be declared after a Given, When, or And.', node.location);
            errors.push(e);
            return false;
        }
        if (context.inVariantBackground || context.inScenarioVariantBackground) {
            let e = new SyntaticException_1.SyntaticException('The "' + node.nodeType + '" clause cannot be declared for a Variant Background.', node.location);
            errors.push(e);
            return false;
        }
        // Prepare the owner to receive the given node
        let owner = null;
        if (context.inBackground)
            owner = context.currentBackground;
        else if (context.inScenario)
            owner = context.currentScenario;
        else if (context.inVariant)
            owner = context.currentVariant;
        else if (context.inTestCase)
            owner = context.currentTestCase;
        else {
            let e = new SyntaticException_1.SyntaticException('The "' + node.nodeType + '" clause must be declared after a Background, Scenario, Variant or Test Case.', node.location);
            errors.push(e);
            return false;
        }
        if (!owner) {
            let e = new SyntaticException_1.SyntaticException('Invalid context for the step "' + node.nodeType + '".', node.location);
            errors.push(e);
            return false;
        }
        if (!owner.sentences) {
            owner.sentences = [];
        }
        // Adds the given node
        owner.sentences.push(node);
        return true;
    }
}
exports.StepThenParser = StepThenParser;
