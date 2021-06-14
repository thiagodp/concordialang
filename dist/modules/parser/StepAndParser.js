import { NodeTypes } from '../req/NodeTypes';
import { SyntacticException } from './SyntacticException';
/**
 * Step And node parser.
 *
 * @author Thiago Delgado Pinto
 */
export class StepAndParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks prior nodes
        const allowedPriorNodes = [
            NodeTypes.STEP_GIVEN,
            NodeTypes.STEP_WHEN,
            NodeTypes.STEP_THEN,
            NodeTypes.STEP_AND,
            NodeTypes.STEP_OTHERWISE
        ];
        if (!it.hasPrior() || allowedPriorNodes.indexOf(it.spyPrior().nodeType) < 0) {
            let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared after a Given, When, Then, And, or Otherwise.', node.location);
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
                let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared after a Background, Scenario, Variant Background, Variant, Test Case, Before All, After All, Before Feature, After Feature, Before Each Scenario, AfterEachScenario or UI Element Property.', node.location);
                errors.push(e);
                return false;
            }
            if (!owner) {
                let e = new SyntacticException('Invalid context for the step "' + node.nodeType + '".', node.location);
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
