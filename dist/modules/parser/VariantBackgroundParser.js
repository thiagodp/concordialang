"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntacticException_1 = require("../req/SyntacticException");
/**
 * Variant Background parser
 *
 * @author Thiago Delgado Pinto
 */
class VariantBackgroundParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks if a feature has been declared before it
        if (!context.doc.feature) {
            let e = new SyntacticException_1.SyntacticException('A background must be declared after a feature.', node.location);
            errors.push(e);
            return false;
        }
        let feature = context.doc.feature;
        const wasDeclaredForTheFeature = !!feature.variantBackground;
        const doesNotHaveScenarios = !feature.scenarios || feature.scenarios.length < 1;
        if (wasDeclaredForTheFeature && doesNotHaveScenarios) {
            let e = new SyntacticException_1.SyntacticException('A feature cannot have more than one variant background.', node.location);
            errors.push(e);
            return false;
        }
        let target = doesNotHaveScenarios ? feature : context.currentScenario;
        if (!target) { // Only when currentScenario is not defined
            let e = new SyntacticException_1.SyntacticException('Could not determine the current scenario for the variant background.', node.location);
            errors.push(e);
            return false;
        }
        // Sets the node
        target.variantBackground = node;
        // Adjusts the context
        context.resetInValues();
        if (doesNotHaveScenarios) {
            context.inVariantBackground = true;
            context.currentVariantBackground = node;
        }
        else {
            context.inScenarioVariantBackground = true;
            context.currentScenarioVariantBackground = node;
        }
    }
}
exports.VariantBackgroundParser = VariantBackgroundParser;
