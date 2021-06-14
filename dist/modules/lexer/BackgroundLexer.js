import { NodeTypes } from "../req/NodeTypes";
import { BlockLexer } from "./BlockLexer";
/**
 * Detects a Background block.
 *
 * @author Thiago Delgado Pinto
 */
export class BackgroundLexer extends BlockLexer {
    constructor(words) {
        super(words, NodeTypes.BACKGROUND);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_GIVEN, NodeTypes.VARIANT_BACKGROUND, NodeTypes.SCENARIO];
    }
}
