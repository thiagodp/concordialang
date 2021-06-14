import { NodeTypes } from "../req/NodeTypes";
import { NamePlusNumberNodeLexer } from "./NamePlusNumberNodeLexer";
/**
 * Detects a Variant.
 *
 * @author Thiago Delgado Pinto
 */
export class VariantLexer extends NamePlusNumberNodeLexer {
    constructor(words) {
        super(words, NodeTypes.VARIANT);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_GIVEN];
    }
}
