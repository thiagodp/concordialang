"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
const SyntaticException_1 = require("../req/SyntaticException");
/**
 * Step And node parser.
 *
 * @author Thiago Delgado Pinto
 */
class StepAndParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks prior nodes
        const allowedPriorNodes = [
            NodeTypes_1.NodeTypes.STEP_GIVEN,
            NodeTypes_1.NodeTypes.STEP_WHEN,
            NodeTypes_1.NodeTypes.STEP_THEN,
            NodeTypes_1.NodeTypes.STEP_AND,
            NodeTypes_1.NodeTypes.STEP_OTHERWISE
        ];
        if (!it.hasPrior() || allowedPriorNodes.indexOf(it.spyPrior().nodeType) < 0) {
            let e = new SyntaticException_1.SyntaticException('The "' + node.nodeType + '" clause must be declared after a Given, When, Then, And, or Otherwise.', node.location);
            errors.push(e);
            return false;
        }
        if (context.inUIProperty) {
            // Prepare the owner to receive the node
            if (!context.currentUIProperty.otherwiseSentences) {
                context.currentUIProperty.otherwiseSentences = [];
            }
            // Adds the node
            context.currentUIProperty.otherwiseSentences.push(node);
        }
        else {
            // Prepare the owner to receive the node
            let owner = null;
            if (context.inBackground)
                owner = context.currentBackground;
            else if (context.inVariantBackground)
                owner = context.currentVariantBackground;
            else if (context.inScenario)
                owner = context.currentScenario;
            else if (context.inScenarioVariantBackground)
                owner = context.currentScenarioVariantBackground;
            else if (context.inVariant)
                owner = context.currentVariant;
            else if (context.inTestCase)
                owner = context.currentTestCase;
            else {
                let e = new SyntaticException_1.SyntaticException('The "' + node.nodeType + '" clause must be declared after a Background, Scenario, Variant Background, Variant, Test Case or UI Element Property.', node.location);
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
        }
        return true;
    }
}
exports.StepAndParser = StepAndParser;
