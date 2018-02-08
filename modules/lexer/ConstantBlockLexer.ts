import { BlockLexer } from "./BlockLexer";
import { ConstantBlock } from "../ast/ConstantBlock";
import { NodeTypes } from "../req/NodeTypes";

/**
 * Detects a Contant Block.
 * 
 * @author Thiago Delgado Pinto
 */
export class ConstantBlockLexer extends BlockLexer< ConstantBlock > {
    
    constructor( words: string[] ) {
        super( words, NodeTypes.CONSTANT_BLOCK );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [
            NodeTypes.CONSTANT
        ];
    }    
    
}