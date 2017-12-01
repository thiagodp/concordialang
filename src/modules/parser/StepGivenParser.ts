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
            NodeTypes.TEMPLATE,
            NodeTypes.VARIANT,
            NodeTypes.STEP_GIVEN
        ];

        if ( ! it.hasPrior() || allowedPriorNodes.indexOf( it.spyPrior().nodeType ) < 0 ) {
            let e = new SyntaticException(
                'The "' + node.nodeType + '" clause must be declared after Scenario, a Template, a Variant, or a Given.',
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