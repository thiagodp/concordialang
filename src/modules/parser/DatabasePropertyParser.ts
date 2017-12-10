import { PropertyParser } from "./PropertyParser";
import { ListItem } from '../ast/ListItem';
import { NodeIterator } from './NodeIterator';
import { ParsingContext } from './ParsingContext';
import { NodeTypes } from "../req/NodeTypes";
import { SyntaticException } from "../req/SyntaticException";
import { DatabaseProperty } from "../ast/Database";

/**
 * Database property parser.
 * 
 * @author Thiago Delgado Pinto
 */
export class DatabasePropertyParser implements PropertyParser {

    /** @inheritDoc */
    isAccepted( node: ListItem, it: NodeIterator ): boolean {
        const allowedPriorNodes = [
            NodeTypes.DATABASE,
            NodeTypes.DATABASE_PROPERTY
        ];
        return allowedPriorNodes.indexOf( it.spyPrior().nodeType ) >= 0;
    }
    
    
    /** @inheritDoc */
    handle( node: ListItem, context: ParsingContext, errors: Error[] ): boolean {

        // Adjusts the node type
        node.nodeType = NodeTypes.DATABASE_PROPERTY;
        
        // Checks the context
        if ( ! context.currentDatabase ) {
            let e = new SyntaticException(
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