import { AfterFeature } from 'concordialang-types/ast';
import { SyntaticException } from '../req/SyntaticException';
import { isDefined } from '../util/TypeChecking';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from './ParsingContext';

/**
 * AfterFeature parser
 *
 * @author Thiago Delgado Pinto
 */
export class AfterFeatureParser implements NodeParser< AfterFeature > {

    /** @inheritDoc */
    public analyze( node: AfterFeature, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Check whether a Feature was declared
        if ( ! context.doc.feature ) {
            let e = new SyntaticException(
                'The event After Feature must be declared after a Feature', node.location );
            errors.push( e );
            return false;
        }

        // Check whether a similar node was already declared
        if ( isDefined( context.doc.afterFeature ) ) {
            let e = new SyntaticException(
                'Event already declared: After Feature', node.location );
            errors.push( e );
            return false;
        }

        // Adjust the context
        context.resetInValues();
        context.inAfterFeature = true;

        // Adjust the document
        context.doc.afterFeature = node;

        return true;
    }

}