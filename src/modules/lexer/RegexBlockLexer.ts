import { KeywordBlockLexer } from "./KeywordBlockLexer";
import { RegexBlock } from "../ast/RegexBlock";
import { NodeTypes } from "../req/NodeTypes";

/**
 * Detects a Regex Block.
 * 
 * @author Thiago Delgado Pinto
 */
export class RegexBlockLexer extends KeywordBlockLexer< RegexBlock > {
    
    constructor( words: string[] ) {
        super( words, NodeTypes.REGEX_BLOCK );
    }
    
}