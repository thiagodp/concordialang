import { StepOtherwise, UIProperty } from '../ast';
import { NodeTypes } from '../req/NodeTypes';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from "./ParsingContext";
import { SyntacticException } from './SyntacticException';

/**
 * Step Otherwise node parser.
 *
 * @author Thiago Delgado Pinto
 */
export class StepOtherwiseParser implements NodeParser< StepOtherwise > {

    /** @inheritDoc */
    public analyze( node: StepOtherwise, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks prior nodes
        const allowedPriorNodes = [
            NodeTypes.UI_PROPERTY,
            NodeTypes.STEP_OTHERWISE,
            NodeTypes.STEP_AND
        ];

        if ( ! it.hasPrior() || allowedPriorNodes.indexOf( it.spyPrior().nodeType ) < 0 ) {
            let e = new SyntacticException(
                'The "' + node.nodeType + '" clause must be declared after a UI Element Property.',
                node.location
                );
            errors.push( e );
            return false;
        }

        let prior: UIProperty = it.spyPrior() as any;

        // Checks the structure
        if ( ! prior.otherwiseSentences ) {
            prior.otherwiseSentences = [];
        }

        // Adds the node
        prior.otherwiseSentences.push( node );

        return true;
    }

}