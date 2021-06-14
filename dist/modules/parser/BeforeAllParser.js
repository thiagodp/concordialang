import { isDefined } from '../util/TypeChecking';
import { SyntacticException } from './SyntacticException';
/**
 * BeforeAll parser
 *
 * @author Thiago Delgado Pinto
 */
export class BeforeAllParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Check whether a similar node was already declared
        if (isDefined(context.doc.beforeAll)) {
            let e = new SyntacticException('Event already declared: Before All', node.location);
            errors.push(e);
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
