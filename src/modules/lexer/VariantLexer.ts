import { NodeTypes } from "../req/NodeTypes";
import { NamedNodeLexer } from "./NamedNodeLexer";
import { Variant } from "../ast/Variant";

/**
 * Detects a Variant.
 * 
 * @author Thiago Delgado Pinto
 */
export class VariantLexer extends NamedNodeLexer< Variant > {
    
    constructor( words: string[] ) {
        super( words, NodeTypes.VARIANT );
    }
}