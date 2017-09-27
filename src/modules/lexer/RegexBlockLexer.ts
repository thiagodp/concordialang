import { KeywordBlockLexer } from "./KeywordBlockLexer";
import { RegexesBlock } from "../ast/RegexBlock";
import { TokenTypes } from "../req/TokenTypes";

/**
 * Detects a Regex Block.
 * 
 * @author Thiago Delgado Pinto
 */
export class RegexBlockLexer extends KeywordBlockLexer< RegexesBlock > {
    
    constructor( words: string[] ) {
        super( words, TokenTypes.REGEX_BLOCK );
    }
    
}
    