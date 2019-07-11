import { Background } from '../ast/Background';
import { SyntacticException } from './SyntacticException';
import { isDefined } from '../util/TypeChecking';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from './ParsingContext';

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
            let e = new SyntacticException(
                'A background must be declared after a feature.', node.location );
            errors.push( e );
            return false;
        }

        let feature = context.doc.feature;

        if ( feature.background ) {
            let e = new SyntacticException(
                'A feature cannot have more than one background.', node.location );
            errors.push( e );
            return false;
        }

        if ( isDefined( feature.scenarios ) && feature.scenarios.length > 0 ) {
            let e = new SyntacticException(
                'A background must be declared before a scenario.', node.location );
            errors.push( e );
            return false;
        }

        // Sets the node
        feature.background = node;

        // Adjust the context
        context.resetInValues();
        context.inBackground = true;
        context.currentBackground = node;

        return true;
    }

}