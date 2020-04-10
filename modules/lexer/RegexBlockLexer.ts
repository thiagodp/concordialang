import { RegexBlock } from "../ast/RegexBlock";
import { NodeTypes } from "../req/NodeTypes";
import { BlockLexer } from "./BlockLexer";

/**
 * Detects a Regex Block.
 *
 * @author Thiago Delgado Pinto
 */
export class RegexBlockLexer extends BlockLexer< RegexBlock > {

    constructor( words: string[] ) {
        super( words, NodeTypes.REGEX_BLOCK );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.REGEX ];
    }

}