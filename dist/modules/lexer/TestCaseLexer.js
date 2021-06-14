import { NodeTypes } from "../req/NodeTypes";
import { NamedNodeLexer } from "./NamedNodeLexer";
/**
 * Detects a TestCase.
 *
 * @author Thiago Delgado Pinto
 */
export class TestCaseLexer extends NamedNodeLexer {
    constructor(words) {
        super(words, NodeTypes.TEST_CASE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_GIVEN];
    }
}
