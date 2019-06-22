import { Scenario } from "../ast/Scenario";
import { NodeTypes } from "../req/NodeTypes";
import { NamedNodeLexer } from "./NamedNodeLexer";

/**
 * Detects a Scenario.
 *
 * @author Thiago Delgado Pinto
 */
export class ScenarioLexer extends NamedNodeLexer< Scenario > {

    constructor( words: Array< string > ) {
        super( words, NodeTypes.SCENARIO );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_GIVEN, NodeTypes.SCENARIO, NodeTypes.VARIANT_BACKGROUND, NodeTypes.VARIANT ];
    }

}