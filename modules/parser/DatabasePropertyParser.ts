import { ListItem, DatabaseProperty } from "../ast";
import { NodeTypes } from "../req/NodeTypes";
import { SyntacticException } from "./SyntacticException";
import { ListItemNodeParser } from "./ListItemNodeParser";
import { NodeIterator } from './NodeIterator';
import { ParsingContext } from './ParsingContext';

/**
 * Database property parser.
 *
 * @author Thiago Delgado Pinto
 */
export class DatabasePropertyParser implements ListItemNodeParser {

    /** @inheritDoc */
    isAccepted( node: ListItem, it: NodeIterator ): boolean {
        const allowedPriorNodes = [
            NodeTypes.DATABASE,
            NodeTypes.DATABASE_PROPERTY
        ];
        return allowedPriorNodes.indexOf( it.spyPrior().nodeType ) >= 0;
    }


    /** @inheritDoc */
    handle( node: ListItem, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Adjusts the node type
        node.nodeType = NodeTypes.DATABASE_PROPERTY;

        // Checks the context
        if ( ! context.currentDatabase ) {
            let e = new SyntacticException(
                'The "' + node.nodeType + '" clause must be declared for a Database.',
                node.location
                );
            errors.push( e );
            return false;
        }

        // Adjust the context
        context.resetInValues();

        // Checks the structure
        if ( ! context.currentDatabase.items ) {
            context.currentDatabase.items = [];
        }

        // Adds the node
        context.currentDatabase.items.push( node as DatabaseProperty );

        return true;
    }

}