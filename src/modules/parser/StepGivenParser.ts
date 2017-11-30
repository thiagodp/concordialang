import { NodeTypes } from '../req/NodeTypes';
import { StepGiven } from '../ast/Step';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from "./ParsingContext";

/**
 * Step Given node parser.
 * 
 * @author Thiago Delgado Pinto
 */
export class StepGivenParser implements NodeParser< StepGiven > {

    /** @inheritDoc */
    public analyze( node: StepGiven, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks prior nodes
        const allowedPriorNodes = [
            NodeTypes.SCENARIO,
            NodeTypes.VARIANT,
            NodeTypes.STEP_GIVEN
        ];
        if ( ! it.hasPrior() || allowedPriorNodes.indexOf( it.spyPrior().nodeType ) < 0 ) {
            let e = new SyntaticException(
                'The "' + node.nodeType + '" clause must be declared after Scenario, a Test Case, or a Given.',
                node.location
                );
            errors.push( e );
            return false;                
        }

        // Checks the context
        if ( ! context.inScenario && ! context.inTestCase ) {
            let e = new SyntaticException(
                'The "' + node.nodeType + '" clause must be declared after a Scenario or a Test Case.',
                node.location
                );
            errors.push( e );
            return false;
        }

        // Prepare the owner to receive the given node
        let owner = context.inScenario ? context.currentScenario : context.currentTestCase;
        if ( ! owner.sentences ) {
            owner.sentences = [];
        }

        // Adds the given node
        owner.sentences.push( node );

        return true;
    }

}