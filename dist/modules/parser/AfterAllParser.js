import { isDefined } from '../util/type-checking';
import { SyntacticException } from './SyntacticException';
/**
 * AfterAll parser
 *
 * @author Thiago Delgado Pinto
 */
export class AfterAllParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Check whether a similar node was already declared
        if (isDefined(context.doc.afterAll)) {
            let e = new SyntacticException('Event already declared: After All', node.location);
            errors.push(e);
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
