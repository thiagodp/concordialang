import { NodeTypes } from '../req/NodeTypes';
import { StepThen } from '../ast/Step';
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
            NodeTypes.STEP_AND
        ];

        if ( ! it.hasPrior() || allowedPriorNodes.indexOf( it.spyPrior().nodeType ) < 0 ) {
            let e = new SyntaticException(
                'The "' + node.nodeType + '" clause must be declared after a Given, a When, or an And.',
                node.location
                );
            errors.push( e );
            return false;                
        }

        // Prepare the owner to receive the given node
        let owner = null;
        
        if ( context.inScenario ) owner = context.currentScenario;
        else if ( context.inVariant ) owner = context.currentVariant;
        else if ( context.inTemplate ) owner = context.currentTemplate;
        else {
            let e = new SyntaticException(
                'The "' + node.nodeType + '" clause must be declared after a Scenario, a Template or a Variant.',
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