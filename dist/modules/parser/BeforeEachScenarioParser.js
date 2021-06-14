import { isDefined } from '../util/TypeChecking';
import { SyntacticException } from './SyntacticException';
/**
 * BeforeEachScenario parser
 *
 * @author Thiago Delgado Pinto
 */
export class BeforeEachScenarioParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Check whether a Feature was declared
        if (!context.doc.feature) {
            let e = new SyntacticException('The event Before Each Scenario must be declared after a Feature', node.location);
            errors.push(e);
            return false;
        }
        // Check whether a similar node was already declared
        if (isDefined(context.doc.beforeEachScenario)) {
            let e = new SyntacticException('Event already declared: Before Each Scenario', node.location);
            errors.push(e);
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
