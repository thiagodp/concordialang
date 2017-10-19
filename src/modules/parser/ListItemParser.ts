import { DatabaseProperty } from '../ast/DataSource';
import { UIProperty } from '../ast/UIElement';
import { ListItem } from '../ast/ListItem';
import { NodeParser } from './NodeParser';
import { ParsingContext } from './ParsingContext';
import { NodeIterator } from './NodeIterator';
import { NodeTypes } from '../req/NodeTypes';
import { SyntaticException } from '../req/SyntaticException';

/**
 * Parses a ListItem node and decide what node type it will be.
 * 
 * @author Thiago Delgado Pinto
 */
export class ListItemParser implements NodeParser< ListItem > {
    
    analyze(
        node: ListItem,
        context: ParsingContext,
        it: NodeIterator,
        errors: Error[]
    ): boolean {

        if ( ! it.hasPrior() ) {
            return false; // Nothing to do here
        }
        
        if ( this.looksLikeAUIProperty( node, it ) ) {
            return this.handleAsUIProperty( node, context, errors );
        } else if ( this.looksLikeADatabaseProperty( node, it ) ) {
            return this.handleAsDatabaseProperty( node, context, errors );
        }

        // Stay as a ListItem
        return true;
    }

    //#region UI PROPERTY

    private looksLikeAUIProperty( node: ListItem, it: NodeIterator ): boolean {
        const allowedPriorNodes = [
            NodeTypes.UI_ELEMENT,
            NodeTypes.UI_PROPERTY,
            NodeTypes.STEP_OTHERWISE,
            NodeTypes.STEP_AND
        ];
        if ( allowedPriorNodes.indexOf( it.spyPrior().nodeType ) < 0 ) {
            return true;
        }
        return false;
    }

    private handleAsUIProperty( node: ListItem, context: ParsingContext, errors: Error[] ): boolean {
        
        // Adjusts the node type
        node.nodeType = NodeTypes.UI_PROPERTY;
        
        // Checks the context
        if ( ! context.currentUIElement ) {
            let e = new SyntaticException(
                'The "' + node.nodeType + '" clause must be declared for a UI Element.',
                node.location
                );
            errors.push( e );
            return false;
        }

        // Adjusts the context
        context.resetInValues();
        context.inUIProperty = true;

        // Checks the structure
        let uiProperty: UIProperty = node as UIProperty;
        context.currentUIProperty = uiProperty;
        if ( ! context.currentUIElement.items ) {
            context.currentUIElement.items = [];
        }

        // Adds the node
        context.currentUIElement.items.push( uiProperty );

        return true;
    }

    //#endregion

    //#region DATABASE PROPERTY

    private looksLikeADatabaseProperty( node: ListItem, it: NodeIterator ): boolean {
        const allowedPriorNodes = [
            NodeTypes.DATABASE,
            NodeTypes.DATABASE_PROPERTY
        ];
        if ( allowedPriorNodes.indexOf( it.spyPrior().nodeType ) < 0 ) {
            return true;
        }
        return false;
    }

    private handleAsDatabaseProperty( node: ListItem, context: ParsingContext, errors: Error[] ): boolean {
        
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

    //#endregion

}