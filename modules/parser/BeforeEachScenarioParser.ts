import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from "./ParsingContext";
import { BeforeEachScenario } from '../ast/TestEvent';
import { isDefined } from '../util/TypeChecking';

/**
 * BeforeEachScenario parser
 *
 * @author Thiago Delgado Pinto
 */
export class BeforeEachScenarioParser implements NodeParser< BeforeEachScenario > {

    /** @inheritDoc */
    public analyze( node: BeforeEachScenario, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Check whether a Feature was declared
        if ( ! context.doc.feature ) {
            let e = new SyntaticException(
                'The event Before Each Scenario must be declared after a Feature', node.location );
            errors.push( e );
            return false;
        }

        // Check whether a similar node was already declared
        if ( isDefined( context.doc.beforeEachScenario ) ) {
            let e = new SyntaticException(
                'Event already declared: Before Each Scenario', node.location );
            errors.push( e );
            return false;
        }

        // Adjust the context
        context.resetInValues();
        context.inBeforeEachScenario = true;

        // Adjust the document
        context.doc.beforeEachScenario = node;

        return true;
    }

}