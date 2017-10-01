import { TextCollector } from './TextCollector';
import { TagCollector } from './TagCollector';
import { Feature } from "../ast/Feature";
import { Node } from '../ast/Node';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from "./ParsingContext";

/**
 * Feature parser
 * 
 * @author Thiago Delgado Pinto
 */
export class FeatureParser implements NodeParser< Feature > {

    /** @inheritDoc */
    public analyze( node: Feature, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks if it is already declared
        if ( context.doc.feature ) {
            let e = new SyntaticException( 'Just one feature declaration is allowed.', node.location );
            errors.push( e );
            return false;
        }

        // Define the current feature
        context.doc.feature = node;

        // Adjust the context
        context.resetInValues();
        context.inFeature = true;

        // Add backwards tags
        if ( ! node.tags ) {
            node.tags = [];
        }
        ( new TagCollector() ).addBackwardTags( it, node.tags ); // does not touch the iterator

        // Add forward text sentences
        if ( ! node.sentences ) {
            node.sentences = [];
        }        
        ( new TextCollector() ).addForwardTextNodes( it, node.sentences, true ); // true == change iterator

        return true;
    }

}