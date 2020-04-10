import { BeforeFeature } from '../ast/TestEvent';
import { isDefined } from '../util/TypeChecking';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from './ParsingContext';
import { SyntacticException } from './SyntacticException';

/**
 * BeforeFeature parser
 *
 * @author Thiago Delgado Pinto
 */
export class BeforeFeatureParser implements NodeParser< BeforeFeature > {

    /** @inheritDoc */
    public analyze( node: BeforeFeature, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Check whether a Feature was declared
        if ( ! context.doc.feature ) {
            let e = new SyntacticException(
                'The event Before Feature must be declared after a Feature', node.location );
            errors.push( e );
            return false;
        }

        // Check whether a similar node was already declared
        if ( isDefined( context.doc.beforeFeature ) ) {
            let e = new SyntacticException(
                'Event already declared: Before Feature', node.location );
            errors.push( e );
            return false;
        }

        // Adjust the context
        context.resetInValues();
        context.inBeforeFeature = true;

        // Adjust the document
        context.doc.beforeFeature = node;

        return true;
    }

}