import { RegexBlock } from "concordialang-types/ast";
import { BlockLexer } from "./BlockLexer";
import { NodeTypes } from "../req/NodeTypes";

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