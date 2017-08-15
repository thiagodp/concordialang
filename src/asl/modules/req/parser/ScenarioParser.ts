import { Scenario } from "../ast/Scenario";
import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { SyntaticException } from '../SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { Keywords } from "../Keywords";
import { ParsingContext } from "./ParsingContext";

export class ScenarioParser implements NodeParser< Scenario > {

    public analyze( node: Scenario, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks if a feature has been declared before it
        if ( ! context.doc.feature ) {
            let e = new SyntaticException(
                'A scenario must be declared after a feature declaration.', node.location );
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
        context.inFeature = false;
        context.inScenario = true;
        context.currentScenario = node;

        return true;
    }

}