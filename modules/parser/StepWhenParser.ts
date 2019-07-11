import { StepWhen } from '../ast/Step';
import { NodeTypes } from '../req/NodeTypes';
import { SyntacticException } from './SyntacticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from "./ParsingContext";

/**
 * Step When node parser.
 *
 * @author Thiago Delgado Pinto
 */
export class StepWhenParser implements NodeParser< StepWhen > {

    /** @inheritDoc */
    public analyze( node: StepWhen, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks prior nodes

        let allowedPriorNodes = [
            NodeTypes.BACKGROUND,
            NodeTypes.SCENARIO,
            NodeTypes.VARIANT_BACKGROUND,
            NodeTypes.VARIANT,
            NodeTypes.TEST_CASE,

            NodeTypes.BEFORE_ALL,
            NodeTypes.BEFORE_FEATURE,
            NodeTypes.BEFORE_EACH_SCENARIO,
            NodeTypes.AFTER_ALL,
            NodeTypes.AFTER_FEATURE,
            NodeTypes.AFTER_EACH_SCENARIO,

            NodeTypes.STEP_GIVEN,
            NodeTypes.STEP_WHEN,
            NodeTypes.STEP_AND
        ];

        if ( context.inTestCase ) { // because of joint scenarios
            allowedPriorNodes.push( NodeTypes.STEP_THEN );
        }

        if ( ! it.hasPrior() || allowedPriorNodes.indexOf( it.spyPrior().nodeType ) < 0 ) {
            let e = new SyntacticException(
                'The "' + node.nodeType + '" clause must be declared after: ' + allowedPriorNodes.join( ', ' ),
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
            const lastBlock = allowedPriorNodes.indexOf( NodeTypes.STEP_GIVEN );
            const blocks = allowedPriorNodes.filter( ( v, index ) => index < lastBlock );
            let e = new SyntacticException(
                'The "' + node.nodeType + '" clause must be declared after:' + blocks.join( ',' ),
                node.location
                );
            errors.push( e );
            return false;
        }

        if ( ! owner ) {
            let e = new SyntacticException(
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