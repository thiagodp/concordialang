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

        // Has no feature and has no imports?
        if ( ! context.doc.feature
            && ( ! context.doc.imports || context.doc.imports.length < 1 ) ) {
            let e = new SyntaticException(
                'A variant must be declared after a feature. Please declare or import a feature and then declare the variant.', node.location );
            errors.push( e );
            return false;
        }

        // Prepares the owner to receive the variant
        let owner = context.doc.feature ? context.doc.feature : context.doc;    
        if ( ! owner.variants ) {
            owner.variants = [];
        }

        // Adds it to the feature
        owner.variants.push( node );

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