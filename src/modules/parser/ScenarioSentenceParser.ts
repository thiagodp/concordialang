import { Scenario, GivenNode, ScenarioSentence } from "../ast/Scenario";
import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { SyntaticException } from '../req/SyntaticException';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { Keywords } from "../req/Keywords";
import { ParsingContext } from "./ParsingContext";

/**
 * Scenario sentence parser
 * 
 * @author Thiago Delgado Pinto
 */
export class ScenarioSentenceParser implements NodeParser< ScenarioSentence > {

    /** @inheritDoc */
    public analyze( node: ScenarioSentence, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        // Checks the context
        if ( ! context.inScenario && ! context.inInteraction ) {
            let e = new SyntaticException(
                'The "' + node.keyword + '" clause must be declared after a scenario or an interaction.',
                node.location
                );
            errors.push( e );
            return false;
        }

        // Prepare the owner to receive the given node
        let owner = context.inScenario ? context.currentScenario : context.currentInteraction;
        if ( ! owner.sentences ) {
            owner.sentences = [];
        }

        // Adds the given node
        owner.sentences.push( node );

        return true;
    }

}