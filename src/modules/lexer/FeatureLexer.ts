import { NamedNodeLexer } from "./NamedNodeLexer";
import { Feature } from "../ast/Feature";
import { Keywords } from "../req/Keywords";

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