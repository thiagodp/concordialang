import { Variant } from 'concordialang-types/ast';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from './ParsingContext';
import { TagCollector } from './TagCollector';

/**
 * Variant parser
 *
 * @author Thiago Delgado Pinto
 */
export class VariantParser implements NodeParser< Variant > {

    /** @inheritDoc */
    public analyze( node: Variant, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks if a scenario has been declared
        if ( ! context.doc.feature
            || ! context.doc.feature.scenarios
            || context.doc.feature.scenarios.length < 1
        ) {
            let e = new SyntaticException(
                'A variant must be declared after a scenario.', node.location );
            errors.push( e );
            return false;
        }

        // Prepares the scenario to receive the variant
        let scenario = context.doc.feature.scenarios[ context.doc.feature.scenarios.length - 1 ];
        if ( ! scenario.variants ) {
            scenario.variants = [];
        }

        // Adds it to the scenario
        scenario.variants.push( node );

        // Adjusts the context
        context.resetInValues();
        context.inVariant = true;
        context.currentVariant = node;

        // Adds backward tags
        if ( ! node.tags ) {
            node.tags = [];
        }
        ( new TagCollector() ).addBackwardTags( it, node.tags );

        return true;
    }

}