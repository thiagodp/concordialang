import { NodeTypes } from "../req/NodeTypes";
import { NamedNodeLexer } from "./NamedNodeLexer";
/**
 * Detects a Scenario.
 *
 * @author Thiago Delgado Pinto
 */
export class ScenarioLexer extends NamedNodeLexer {
    constructor(words) {
        super(words, NodeTypes.SCENARIO);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_GIVEN, NodeTypes.SCENARIO, NodeTypes.VARIANT_BACKGROUND, NodeTypes.VARIANT];
    }
}
