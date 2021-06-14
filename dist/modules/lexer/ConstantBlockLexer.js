import { NodeTypes } from "../req/NodeTypes";
import { BlockLexer } from "./BlockLexer";
/**
 * Detects a Contant Block.
 *
 * @author Thiago Delgado Pinto
 */
export class ConstantBlockLexer extends BlockLexer {
    constructor(words) {
        super(words, NodeTypes.CONSTANT_BLOCK);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [
            NodeTypes.CONSTANT
        ];
    }
}
