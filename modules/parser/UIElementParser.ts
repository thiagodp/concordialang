import { UIElement, ReservedTags } from '../ast';
import { SyntacticException } from '../req/SyntacticException';
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

        // Adds backward tags
        if ( ! node.tags ) {
            node.tags = [];
        }
        ( new TagCollector() ).addBackwardTags( it, node.tags );

        // Checks for a "global" tag
        // const hasGlobalTag = node.tags.length > 0
        //     && node.tags.filter( tag => tag.name.toLowerCase() == ReservedTags.GLOBAL ).length > 0;
        const hasGlobalTag = node.tags.length > 0
            && node.tags.filter( tag => tag.subType === ReservedTags.GLOBAL ).length > 0;

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
            let e = new SyntacticException(
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