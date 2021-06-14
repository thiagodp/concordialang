import { isDefined } from '../util/TypeChecking';
import { SyntacticException } from './SyntacticException';
/**
 * BeforeFeature parser
 *
 * @author Thiago Delgado Pinto
 */
export class BeforeFeatureParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Check whether a Feature was declared
        if (!context.doc.feature) {
            let e = new SyntacticException('The event Before Feature must be declared after a Feature', node.location);
            errors.push(e);
            return false;
        }
        // Check whether a similar node was already declared
        if (isDefined(context.doc.beforeFeature)) {
            let e = new SyntacticException('Event already declared: Before Feature', node.location);
            errors.push(e);
            return false;
        }
        // Adjust the context
        context.resetInValues();
        context.inBeforeFeature = true;
        // Adjust the document
        context.doc.beforeFeature = node;
        return true;
    }
}
