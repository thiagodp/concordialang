import { NodeTypes } from '../req/NodeTypes';
import { SyntacticException } from './SyntacticException';
/**
 * Step Otherwise node parser.
 *
 * @author Thiago Delgado Pinto
 */
export class StepOtherwiseParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks prior nodes
        const allowedPriorNodes = [
            NodeTypes.UI_PROPERTY,
            NodeTypes.STEP_OTHERWISE,
            NodeTypes.STEP_AND
        ];
        if (!it.hasPrior() || allowedPriorNodes.indexOf(it.spyPrior().nodeType) < 0) {
            let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared after a UI Element Property.', node.location);
            errors.push(e);
            return false;
        }
        let prior = it.spyPrior();
        // Checks the structure
        if (!prior.otherwiseSentences) {
            prior.otherwiseSentences = [];
        }
        // Adds the node
        prior.otherwiseSentences.push(node);
        return true;
    }
}
