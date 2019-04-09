import { UIElement } from 'concordialang-types/ast';
import { ReservedTags } from '../req/ReservedTags';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from './ParsingContext';
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

        // Adjust the context
        context.resetInValues();
        context.currentUIElement = node;

        // Checks the structure
        if ( owner && ! owner.uiElements ) {
            owner.uiElements = [];
        }

        // If it is NOT global, a feature must have been declared
        if ( ! hasGlobalTag && ! context.doc.feature ) {
            let e = new SyntaticException(
                'A non-global UI Element must be declared after a Feature.', node.location );
            errors.push( e );
            return false;
        }

        // Adds the node
        if ( owner ) {
            owner.uiElements.push( node );
        }

        return true;
    }

}