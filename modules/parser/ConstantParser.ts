import { Constant, ListItem } from '../ast';
import { NodeTypes } from '../req/NodeTypes';
import { ListItemNodeParser } from './ListItemNodeParser';
import { NodeIterator } from './NodeIterator';
import { ParsingContext } from './ParsingContext';
import { SyntacticException } from './SyntacticException';

/**
 * Constant parser.
 *
 * @author Thiago Delgado Pinto
 */
export class ConstantParser implements ListItemNodeParser {

    /** @inheritDoc */
    public isAccepted( node: ListItem, it: NodeIterator ): boolean {
        const allowedPriorNodes = [
            NodeTypes.CONSTANT_BLOCK,
            NodeTypes.CONSTANT
        ];
        return allowedPriorNodes.indexOf( it.spyPrior().nodeType ) >= 0;
    }

    /** @inheritDoc */
    public handle( node: ListItem, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Adjusts the node type
        node.nodeType = NodeTypes.CONSTANT;

        // Checks the context
        if ( ! context.currentConstantBlock
            || ( ! context.inConstantBlock && ! context.inConstant ) ) {
            let e = new SyntacticException(
                'The "' + node.nodeType + '" clause must be declared inside a Constants block.',
                node.location
                );
            errors.push( e );
            return false;
        }

        // Adjusts the context
        context.resetInValues();
        context.inConstant = true;

        // Checks the structure
        if ( ! context.currentConstantBlock.items ) {
            context.currentConstantBlock.items = [];
        }

        // Adds the node
        context.currentConstantBlock.items.push( node as Constant );

        return true;
    }

}