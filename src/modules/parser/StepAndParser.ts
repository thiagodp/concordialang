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

        if ( context.inUIProperty ) {
            // Prepare the owner to receive the node
            if ( ! context.currentUIProperty.otherwiseSentences ) {
                context.currentUIProperty.otherwiseSentences = [];
            }
            // Adds the node
            context.currentUIProperty.otherwiseSentences.push( node );
        } else {
            // Prepare the owner to receive the node
            let owner = null;

            if ( context.inScenario ) owner = context.currentScenario;
            else if ( context.inVariant ) owner = context.currentVariant;
            else if ( context.inTemplate ) owner = context.currentTemplate;
            else {
                let e = new SyntaticException(
                    'The "' + node.nodeType + '" clause must be declared after a Scenario, a Template, a Variant, or a UI Element Property.',
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
        }

        return true;
    }

}