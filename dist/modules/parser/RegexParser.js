import { NodeTypes } from '../req/NodeTypes';
import { SyntacticException } from './SyntacticException';
/**
 * Regex parser.
 *
 * @author Thiago Delgado Pinto
 */
export class RegexParser {
    /** @inheritDoc */
    isAccepted(node, it) {
        const allowedPriorNodes = [
            NodeTypes.REGEX_BLOCK,
            NodeTypes.REGEX
        ];
        return allowedPriorNodes.indexOf(it.spyPrior().nodeType) >= 0;
    }
    /** @inheritDoc */
    handle(node, context, it, errors) {
        // Adjusts the node type
        node.nodeType = NodeTypes.REGEX;
        // Checks the context
        if (!context.currentRegexBlock
            || (!context.inRegexBlock && !context.inRegex)) {
            let e = new SyntacticException('The "' + node.nodeType + '" clause must be declared inside a Regular Expressions block.', node.location);
            errors.push(e);
            return false;
        }
        // Adjusts the context
        context.resetInValues();
        context.inRegex = true;
        // Checks the structure
        if (!context.currentRegexBlock.items) {
            context.currentRegexBlock.items = [];
        }
        // Adds the node
        context.currentRegexBlock.items.push(node);
        return true;
    }
}
