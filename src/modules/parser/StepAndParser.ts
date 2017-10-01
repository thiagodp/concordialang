import { NodeTypes } from '../req/NodeTypes';
import { StepAnd } from '../ast/Step';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from "./ParsingContext";

/**
 * Step And node parser.
 * 
 * @author Thiago Delgado Pinto
 */
export class StepAndParser implements NodeParser< StepAnd > {

    /** @inheritDoc */
    public analyze( node: StepAnd, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks prior nodes
        const allowedPriorNodes = [
            NodeTypes.STEP_GIVEN,
            NodeTypes.STEP_WHEN,
            NodeTypes.STEP_THEN,
            NodeTypes.STEP_AND,
            NodeTypes.STEP_OTHERWISE
        ];
        if ( ! it.hasPrior() || allowedPriorNodes.indexOf( it.spyPrior().nodeType ) < 0 ) {
            let e = new SyntaticException(
                'The "' + node.nodeType + '" clause must be declared after Given, When, Then, And or Otherwise.',
                node.location
                );
            errors.push( e );
            return false;                
        }

        // Checks the context
        if ( ! context.inScenario && ! context.inTestCase && ! context.inUIElementItem ) {
            let e = new SyntaticException(
                'The "' + node.nodeType + '" clause must be declared after a Scenario, a Test case, or an UI Element Item.',
                node.location
                );
            errors.push( e );
            return false;
        }

        if ( context.inUIElementItem ) {
            // Prepare the owner to receive the given node
            if ( ! context.currentUIElementItem.otherwiseSentences ) {
                context.currentUIElementItem.otherwiseSentences = [];
            }
            // Adds the given node
            context.currentUIElementItem.otherwiseSentences.push( node );
        } else {
            // Prepare the owner to receive the given node
            let owner = context.inScenario ? context.currentScenario : context.currentTestCase;
            if ( ! owner.sentences ) {
                owner.sentences = [];
            }
            // Adds the given node
            owner.sentences.push( node );
        }

        return true;
    }

}