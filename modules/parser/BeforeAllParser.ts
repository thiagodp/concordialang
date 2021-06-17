import { BeforeAll } from '../ast/TestEvent';
import { isDefined } from '../util/type-checking';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from './ParsingContext';
import { SyntacticException } from './SyntacticException';

/**
 * BeforeAll parser
 *
 * @author Thiago Delgado Pinto
 */
export class BeforeAllParser implements NodeParser< BeforeAll > {

    /** @inheritDoc */
    public analyze( node: BeforeAll, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Check whether a similar node was already declared
        if ( isDefined( context.doc.beforeAll ) ) {
            let e = new SyntacticException(
                'Event already declared: Before All', node.location );
            errors.push( e );
            return false;
        }

        // Adjust the context
        context.resetInValues();
        context.inBeforeAll = true;

        // Adjust the document
        context.doc.beforeAll = node;

        return true;
    }

}
