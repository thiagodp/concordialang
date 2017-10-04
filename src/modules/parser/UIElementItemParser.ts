import { NodeTypes } from '../req/NodeTypes';
import { NodeParser } from "./NodeParser";
import { ParsingContext } from "./ParsingContext";
import { NodeIterator } from './NodeIterator';
import { SyntaticException } from "../req/SyntaticException";
import { UIProperty } from '../ast/UIElement';

/**
 * UI element property parser.
 * 
 * @author Thiago Delgado Pinto
 */
export class UIPropertyParser implements NodeParser< UIProperty > {
    
    /** @inheritDoc */
    public analyze( node: UIProperty, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Check allowed prior nodes
        const allowedPriorNodes = [
            NodeTypes.UI_ELEMENT,
            NodeTypes.UI_PROPERTY,
            NodeTypes.STEP_OTHERWISE,
            NodeTypes.STEP_AND
        ];
        if ( ! it.hasPrior() || allowedPriorNodes.indexOf( it.spyPrior().nodeType ) < 0 ) {
            let e = new SyntaticException(
                'The "' + node.nodeType + '" clause must be declared after a UI Element, a UI Element Property, a Otherwise, or a And.',
                node.location
                );
            errors.push( e );
            return false;              
        }

        // Adjusts the context
        context.resetInValues();
        context.inUIProperty = true;
        context.currentUIProperty = node;

        return true;
    }
    
}