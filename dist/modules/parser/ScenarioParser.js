import { SyntacticException } from './SyntacticException';
/**
 * Scenario parser
 *
 * @author Thiago Delgado Pinto
 */
export class ScenarioParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks if a feature has been declared before it
        if (!context.doc.feature) {
            let e = new SyntacticException('A scenario must be declared after a feature.', node.location);
            errors.push(e);
            return false;
        }
        // Prepare the feature to receive the scenario
        let feature = context.doc.feature;
        if (!feature.scenarios) {
            feature.scenarios = [];
        }
        // Adds the scenario to the feature
        feature.scenarios.push(node);
        // Adjust the context
        context.resetInValues();
        context.inScenario = true;
        context.currentScenario = node;
        return true;
    }
}
