import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from "./ParsingContext";
import { BeforeAll } from '../ast/TestEvent';
import { isDefined } from '../util/TypeChecking';

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
            let e = new SyntaticException(
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