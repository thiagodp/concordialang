import { SyntacticException } from './SyntacticException';
import { TagCollector } from './TagCollector';
/**
 * Variant parser
 *
 * @author Thiago Delgado Pinto
 */
export class VariantParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks if a scenario has been declared
        if (!context.doc.feature
            || !context.doc.feature.scenarios
            || context.doc.feature.scenarios.length < 1) {
            let e = new SyntacticException('A variant must be declared after a scenario.', node.location);
            errors.push(e);
            return false;
        }
        // Prepares the scenario to receive the variant
        let scenario = context.doc.feature.scenarios[context.doc.feature.scenarios.length - 1];
        if (!scenario.variants) {
            scenario.variants = [];
        }
        // Adds it to the scenario
        scenario.variants.push(node);
        // Adjusts the context
        context.resetInValues();
        context.inVariant = true;
        context.currentVariant = node;
        // Adds backward tags
        if (!node.tags) {
            node.tags = [];
        }
        (new TagCollector()).addBackwardTags(it, node.tags);
        return true;
    }
}
