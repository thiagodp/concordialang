import { NodeTypes } from "../req/NodeTypes";
import { BlockLexer } from "./BlockLexer";
/**
 * Detects a Variant Background block.
 *
 * @author Thiago Delgado Pinto
 */
export class VariantBackgroundLexer extends BlockLexer {
    constructor(words) {
        super(words, NodeTypes.VARIANT_BACKGROUND);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_GIVEN, NodeTypes.SCENARIO, NodeTypes.VARIANT];
    }
}
