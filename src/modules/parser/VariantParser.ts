import { Scenario } from "../ast/Scenario";
import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from "./ParsingContext";
import { Variant } from "../ast/Variant";
import { TagCollector } from "./TagCollector";

/**
 * Variant parser
 * 
 * @author Thiago Delgado Pinto
 */
export class VariantParser implements NodeParser< Variant > {

    /** @inheritDoc */
    public analyze( node: Variant, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks if a feature has been declared
        if ( ! context.doc.feature ) {
            let e = new SyntaticException(
                'A variant must be declared after a feature.', node.location );
            errors.push( e );
            return false;
        }

        // Prepares the feature to receive the variant
        let feature = context.doc.feature;
        if ( ! feature.variants ) {
            feature.variants = [];
        }

        // Adds it to the feature
        feature.variants.push( node );

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