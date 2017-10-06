import { ReservedTags } from '../req/ReservedTags';
import { NodeTypes } from '../req/NodeTypes';
import { NodeParser } from "./NodeParser";
import { ParsingContext } from "./ParsingContext";
import { NodeIterator } from './NodeIterator';
import { SyntaticException } from "../req/SyntaticException";
import { UIElement } from '../ast/UIElement';
import { TagCollector } from './TagCollector';

/**
 * UI element parser.
 * 
 * @author Thiago Delgado Pinto
 */
export class UIElementParser implements NodeParser< UIElement > {
    
    /** @inheritDoc */
    public analyze( node: UIElement, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        const GLOBAL_TAG_NAME = ReservedTags.GLOBAL;

        // Adds backward tags
        if ( ! node.tags ) {
            node.tags = [];
        }        
        ( new TagCollector() ).addBackwardTags( it, node.tags );
        
        // Checks for a "global" tag
        const hasGlobalTag = node.tags.length > 0 
            && node.tags.filter( tag => tag.name.toLowerCase() == GLOBAL_TAG_NAME ).length > 0;

        let owner = hasGlobalTag ? context.doc : context.doc.feature;

        // If it is NOT global, a feature must have been declared
        if ( ! hasGlobalTag && ! context.doc.feature ) {
            let e = new SyntaticException(
                'A non-global UI Element must be declared after a Feature.', node.location );
            errors.push( e );
            return false;
        }

        // Adjust the context
        context.resetInValues();
        context.inUIElement = true;
        context.currentUIElement = node;

        // Checks the structure
        if ( ! owner.uiElements ) {
            owner.uiElements = [];
        }

        // Adds the node
        owner.uiElements.push( node );        

        return true;
    }
    
}