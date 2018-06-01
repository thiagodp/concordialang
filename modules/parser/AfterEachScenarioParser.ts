import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from "./ParsingContext";
import { AfterEachScenario } from '../ast/TestEvent';
import { isDefined } from '../util/TypeChecking';

/**
 * AfterEachScenario parser
 *
 * @author Thiago Delgado Pinto
 */
export class AfterEachScenarioParser implements NodeParser< AfterEachScenario > {

    /** @inheritDoc */
    public analyze( node: AfterEachScenario, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Check whether a Feature was declared
        if ( ! context.doc.feature ) {
            let e = new SyntaticException(
                'The event After Each Scenario must be declared after a Feature', node.location );
            errors.push( e );
            return false;
        }

        // Check whether a similar node was already declared
        if ( isDefined( context.doc.afterEachScenario ) ) {
            let e = new SyntaticException(
                'Event already declared: After Each Scenario', node.location );
            errors.push( e );
            return false;
        }

        // Adjust the context
        context.resetInValues();
        context.inAfterEachScenario = true;

        // Adjust the document
        context.doc.afterEachScenario = node;

        return true;
    }

}