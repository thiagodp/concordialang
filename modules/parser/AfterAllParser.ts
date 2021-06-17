import { AfterAll } from '../ast/TestEvent';
import { isDefined } from '../util/type-checking';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from './ParsingContext';
import { SyntacticException } from './SyntacticException';

/**
 * AfterAll parser
 *
 * @author Thiago Delgado Pinto
 */
export class AfterAllParser implements NodeParser< AfterAll > {

    /** @inheritDoc */
    public analyze( node: AfterAll, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Check whether a similar node was already declared
        if ( isDefined( context.doc.afterAll ) ) {
            let e = new SyntacticException(
                'Event already declared: After All', node.location );
            errors.push( e );
            return false;
        }

        // Adjust the context
        context.resetInValues();
        context.inAfterAll = true;

        // Adjust the document
        context.doc.afterAll = node;

        return true;
    }

}
