import { ListItem, Regex } from '../ast';
import { NodeTypes } from '../req/NodeTypes';
import { ListItemNodeParser } from './ListItemNodeParser';
import { NodeIterator } from './NodeIterator';
import { ParsingContext } from './ParsingContext';
import { SyntacticException } from './SyntacticException';

/**
 * Regex parser.
 *
 * @author Thiago Delgado Pinto
 */
export class RegexParser implements ListItemNodeParser {

    /** @inheritDoc */
    public isAccepted( node: ListItem, it: NodeIterator ): boolean {
        const allowedPriorNodes = [
            NodeTypes.REGEX_BLOCK,
            NodeTypes.REGEX
        ];
        return allowedPriorNodes.indexOf( it.spyPrior().nodeType ) >= 0;
    }

    /** @inheritDoc */
    public handle( node: ListItem, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Adjusts the node type
        node.nodeType = NodeTypes.REGEX;

        // Checks the context
        if ( ! context.currentRegexBlock
            || ( ! context.inRegexBlock && ! context.inRegex ) ) {
            let e = new SyntacticException(
                'The "' + node.nodeType + '" clause must be declared inside a Regular Expressions block.',
                node.location
                );
            errors.push( e );
            return false;
        }

        // Adjusts the context
        context.resetInValues();
        context.inRegex = true;

        // Checks the structure
        if ( ! context.currentRegexBlock.items ) {
            context.currentRegexBlock.items = [];
        }

        // Adds the node
        context.currentRegexBlock.items.push( node as Regex );

        return true;
    }

}