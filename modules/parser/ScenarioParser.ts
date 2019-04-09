import { Scenario } from 'concordialang-types/ast';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from './ParsingContext';

/**
 * Scenario parser
 *
 * @author Thiago Delgado Pinto
 */
export class ScenarioParser implements NodeParser< Scenario > {

    /** @inheritDoc */
    public analyze( node: Scenario, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks if a feature has been declared before it
        if ( ! context.doc.feature ) {
            let e = new SyntaticException(
                'A scenario must be declared after a feature.', node.location );
            errors.push( e );
            return false;
        }

        // Prepare the feature to receive the scenario
        let feature = context.doc.feature;
        if ( ! feature.scenarios ) {
            feature.scenarios = [];
        }

        // Adds the scenario to the feature
        feature.scenarios.push( node );

        // Adjust the context
        context.resetInValues();
        context.inScenario = true;
        context.currentScenario = node;

        return true;
    }

}