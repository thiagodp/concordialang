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
            let e = new SyntaticException_1.SyntaticException('The "' + node.nodeType + '" clause must be declared after: ' + allowedPriorNodes.join(', '), node.location);
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
        else if (context.inBeforeAll)
            owner = context.currentBeforeAll;
        else if (context.inAfterAll)
            owner = context.currentAfterAll;
        else if (context.inBeforeFeature)
            owner = context.currentBeforeFeature;
        else if (context.inAfterFeature)
            owner = context.currentAfterFeature;
        else if (context.inBeforeEachScenario)
            owner = context.currentBeforeEachScenario;
        else if (context.inAfterEachScenario)
            owner = context.currentAfterEachScenario;
        else {
            let e = new SyntaticException_1.SyntaticException('The "' + node.nodeType + '" clause must be declared after a Background, Scenario, Variant Background, Variant, Test Case, Before All, After All, Before Feature, After Feature, Before Each Scenario, AfterEachScenario or UI Element Property.', node.location);
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
