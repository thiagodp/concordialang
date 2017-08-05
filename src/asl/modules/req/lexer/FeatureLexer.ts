import { NamedNodeLexer } from "./NamedNodeLexer";
import { Feature } from "../old_ast/Feature";
import { Keywords } from "../Keywords";

/**
 * Detects a Feature.
 * 
 * @author Thiago Delgado Pinto
 */
export class FeatureLexer extends NamedNodeLexer< Feature > {

    constructor( words: Array< string > ) {
        super( words, Keywords.FEATURE );
    }

}