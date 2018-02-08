import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from "./ParsingContext";
import { Background } from "../ast/Background";

/**
 * Background parser
 * 
 * @author Thiago Delgado Pinto
 */
export class BackgroundParser implements NodeParser< Background > {

    /** @inheritDoc */
    public analyze( node: Background, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks if a feature has been declared before it
        if ( ! context.doc.feature ) {
            let e = new SyntaticException(
                'A background must be declared after a feature.', node.location );
            errors.push( e );
            return false;
        }

        let feature = context.doc.feature;

        if ( feature.background ) {
            let e = new SyntaticException(
                'A feature cannot have more than one background.', node.location );
            errors.push( e );
            return false;            
        }

        if ( feature.scenarios && feature.scenarios.length > 0 ) {
            let e = new SyntaticException(
                'A background must be declared before a scenario.', node.location );
            errors.push( e );
            return false;            
        }

        // Sets the feature
        feature.background = node;

        // Adjust the context
        context.resetInValues();
        context.inBackground = true;
        context.currentBackground = node;

        return true;
    }

}