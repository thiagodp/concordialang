import { NodeTypes } from "../req/NodeTypes";
import { BlockLexer } from "./BlockLexer";
/**
 * Detects a Regex Block.
 *
 * @author Thiago Delgado Pinto
 */
export class RegexBlockLexer extends BlockLexer {
    constructor(words) {
        super(words, NodeTypes.REGEX_BLOCK);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.REGEX];
    }
}
