import { Scenario, GivenNode } from "../ast/Scenario";
import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { SyntaticException } from '../SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { Keywords } from "../Keywords";
import { ParsingContext } from "./ParsingContext";

export class GivenParser implements NodeParser< GivenNode > {

    public analyze( node: GivenNode, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks if a scenario has been declared before it
        if ( ! context.inScenario ) {
            let e = new SyntaticException(
                'The "' + node.keyword + '" clause must be declared after a scenario declaration.',
                node.location
                );
            errors.push( e );
            return false;
        }

        // Prepare the scenario to receive the given
        let scenario = context.currentScenario;
        if ( ! scenario.sentences ) {
            scenario.sentences = [];
        }

        // Adds the given to the scenario
        scenario.sentences.push( node );

        return true;
    }

}