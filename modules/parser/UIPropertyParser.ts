import { ListItem, UIProperty } from '../ast';
import { NodeTypes } from "../req/NodeTypes";
import { ListItemNodeParser } from "./ListItemNodeParser";
import { NodeIterator } from './NodeIterator';
import { ParsingContext } from './ParsingContext';
import { SyntacticException } from "./SyntacticException";
import { TagCollector } from './TagCollector';

/**
 * UI property parser.
 *
 * @author Thiago Delgado Pinto
 */
export class UIPropertyParser implements ListItemNodeParser {

    /** @inheritDoc */
    isAccepted( node: ListItem, it: NodeIterator ): boolean {
        const allowedPriorNodes = [
            NodeTypes.TAG,
            NodeTypes.UI_ELEMENT,
            NodeTypes.UI_PROPERTY,
            NodeTypes.STEP_OTHERWISE,
            NodeTypes.STEP_AND
        ];
        return allowedPriorNodes.indexOf( it.spyPrior().nodeType ) >= 0;
    }


    /** @inheritDoc */
    handle( node: ListItem, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Adjusts the node type
        node.nodeType = NodeTypes.UI_PROPERTY;

        // Checks the context
        if ( ! context.currentUIElement ) {
            let e = new SyntacticException(
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

        // Adds backward tags
        if ( ! uiProperty.tags ) {
            uiProperty.tags = [];
        }
        ( new TagCollector() ).addBackwardTags( it, uiProperty.tags );

        // Adds the node
        context.currentUIElement.items.push( uiProperty );

        return true;
    }

}