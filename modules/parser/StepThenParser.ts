import { StepThen } from 'concordialang-types/ast';
import { NodeTypes } from '../req/NodeTypes';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from "./ParsingContext";

/**
 * Step Then node parser.
 *
 * @author Thiago Delgado Pinto
 */
export class StepThenParser implements NodeParser< StepThen > {

    /** @inheritDoc */
    public analyze( node: StepThen, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks prior nodes
        const allowedPriorNodes = [
            NodeTypes.STEP_GIVEN,
            NodeTypes.STEP_WHEN,
            NodeTypes.STEP_AND,
            NodeTypes.STEP_THEN
        ];

        if ( ! it.hasPrior() || allowedPriorNodes.indexOf( it.spyPrior().nodeType ) < 0 ) {
            let e = new SyntaticException(
                'The "' + node.nodeType + '" clause must be declared after: ' + allowedPriorNodes.join( ', ' ),
                node.location
                );
            errors.push( e );
            return false;
        }

        if ( context.inVariantBackground || context.inScenarioVariantBackground ) {
            let e = new SyntaticException(
                'The "' + node.nodeType + '" clause cannot be declared for a Variant Background.',
                node.location
                );
            errors.push( e );
            return false;
        }

        // Prepare the owner to receive the given node
        let owner = null;

        if ( context.inBackground ) owner = context.currentBackground;
        else if ( context.inVariantBackground ) owner = context.currentVariantBackground;
        else if ( context.inScenario ) owner = context.currentScenario;
        else if ( context.inScenarioVariantBackground ) owner = context.currentScenarioVariantBackground;
        else if ( context.inVariant ) owner = context.currentVariant;
        else if ( context.inTestCase ) owner = context.currentTestCase;
        else if ( context.inBeforeAll ) owner = context.doc.beforeAll;
        else if ( context.inAfterAll ) owner = context.doc.afterAll;
        else if ( context.inBeforeFeature ) owner = context.doc.beforeFeature;
        else if ( context.inAfterFeature ) owner = context.doc.afterFeature;
        else if ( context.inBeforeEachScenario ) owner = context.doc.beforeEachScenario;
        else if ( context.inAfterEachScenario ) owner = context.doc.afterEachScenario;
        else {
            let e = new SyntaticException(
                'The "' + node.nodeType + '" clause must be declared after a Background, Scenario, Variant Background, Variant, Test Case, Before All, After All, Before Feature, After Feature, Before Each Scenario, AfterEachScenario or UI Element Property.',
                node.location
                );
            errors.push( e );
            return false;
        }

        if ( ! owner ) {
            let e = new SyntaticException(
                'Invalid context for the step "' + node.nodeType + '".',
                node.location
                );
            errors.push( e );
            return false;
        }

        if ( ! owner.sentences ) {
            owner.sentences = [];
        }

        // Adds the given node
        owner.sentences.push( node );

        return true;
    }

}