import { isDefined } from '../util/type-checking';
import { SyntacticException } from './SyntacticException';
/**
 * Background parser
 *
 * @author Thiago Delgado Pinto
 */
export class BackgroundParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks if a feature has been declared before it
        if (!context.doc.feature) {
            let e = new SyntacticException('A background must be declared after a feature.', node.location);
            errors.push(e);
            return false;
        }
        let feature = context.doc.feature;
        if (feature.background) {
            let e = new SyntacticException('A feature cannot have more than one background.', node.location);
            errors.push(e);
            return false;
        }
        if (isDefined(feature.scenarios) && feature.scenarios.length > 0) {
            let e = new SyntacticException('A background must be declared before a scenario.', node.location);
            errors.push(e);
            return false;
        }
        // Sets the node
        feature.background = node;
        // Adjust the context
        context.resetInValues();
        context.inBackground = true;
        context.currentBackground = node;
        return true;
    }
}
