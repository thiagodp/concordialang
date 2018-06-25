"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
const SyntaticException_1 = require("../req/SyntaticException");
/**
 * Step Given node parser.
 *
 * @author Thiago Delgado Pinto
 */
class StepGivenParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks prior nodes
        let allowedPriorNodes = [
            NodeTypes_1.NodeTypes.BACKGROUND,
            NodeTypes_1.NodeTypes.SCENARIO,
            NodeTypes_1.NodeTypes.VARIANT_BACKGROUND,
            NodeTypes_1.NodeTypes.VARIANT,
            NodeTypes_1.NodeTypes.TEST_CASE,
            NodeTypes_1.NodeTypes.BEFORE_ALL,
            NodeTypes_1.NodeTypes.BEFORE_FEATURE,
            NodeTypes_1.NodeTypes.BEFORE_EACH_SCENARIO,
            NodeTypes_1.NodeTypes.AFTER_ALL,
            NodeTypes_1.NodeTypes.AFTER_FEATURE,
            NodeTypes_1.NodeTypes.AFTER_EACH_SCENARIO,
            NodeTypes_1.NodeTypes.STEP_GIVEN,
            NodeTypes_1.NodeTypes.STEP_AND
        ];
        if (context.inTestCase) { // because of joint scenarios
            allowedPriorNodes.push(NodeTypes_1.NodeTypes.STEP_WHEN);
            allowedPriorNodes.push(NodeTypes_1.NodeTypes.STEP_THEN);
        }
        if (!it.hasPrior() || allowedPriorNodes.indexOf(it.spyPrior().nodeType) < 0) {
            let e = new SyntaticException_1.SyntaticException('The "' + node.nodeType + '" clause must be declared after: ' + allowedPriorNodes.join(', '), node.location);
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
            owner = context.doc.beforeAll;
        else if (context.inAfterAll)
            owner = context.doc.afterAll;
        else if (context.inBeforeFeature)
            owner = context.doc.beforeFeature;
        else if (context.inAfterFeature)
            owner = context.doc.afterFeature;
        else if (context.inBeforeEachScenario)
            owner = context.doc.beforeEachScenario;
        else if (context.inAfterEachScenario)
            owner = context.doc.afterEachScenario;
        else {
            const lastBlock = allowedPriorNodes.indexOf(NodeTypes_1.NodeTypes.STEP_GIVEN);
            const blocks = allowedPriorNodes.filter((v, index) => index < lastBlock);
            let e = new SyntaticException_1.SyntaticException('The "' + node.nodeType + '" clause must be declared after:' + blocks.join(','), node.location);
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
exports.StepGivenParser = StepGivenParser;
