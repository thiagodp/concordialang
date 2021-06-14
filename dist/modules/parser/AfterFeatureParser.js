import { isDefined } from '../util/TypeChecking';
import { SyntacticException } from './SyntacticException';
/**
 * AfterFeature parser
 *
 * @author Thiago Delgado Pinto
 */
export class AfterFeatureParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Check whether a Feature was declared
        if (!context.doc.feature) {
            let e = new SyntacticException('The event After Feature must be declared after a Feature', node.location);
            errors.push(e);
            return false;
        }
        // Check whether a similar node was already declared
        if (isDefined(context.doc.afterFeature)) {
            let e = new SyntacticException('Event already declared: After Feature', node.location);
            errors.push(e);
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
