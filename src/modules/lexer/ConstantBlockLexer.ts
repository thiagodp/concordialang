import { KeywordBlockLexer } from "./KeywordBlockLexer";
import { ConstantBlock } from "../ast/ContantBlock";
import { NodeTypes } from "../req/NodeTypes";

/**
 * Detects a Contant Block.
 * 
 * @author Thiago Delgado Pinto
 */
export class ConstantBlockLexer extends KeywordBlockLexer< ConstantBlock > {
    
    constructor( words: string[] ) {
        super( words, NodeTypes.CONSTANT_BLOCK );
    }
    
}