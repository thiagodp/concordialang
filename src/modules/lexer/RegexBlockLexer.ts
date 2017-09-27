import { KeywordBlockLexer } from "./KeywordBlockLexer";
import { RegexesBlock } from "../ast/RegexBlock";
import { Keywords } from "../req/Keywords";

/**
 * Detects a Regex Block.
 * 
 * @author Thiago Delgado Pinto
 */
export class RegexBlockLexer extends KeywordBlockLexer< RegexesBlock > {
    
    constructor( words: string[] ) {
        super( words, Keywords.REGEX_BLOCK );
    }
    
}
    