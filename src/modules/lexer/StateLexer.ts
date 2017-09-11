import { Keywords } from "../req/Keywords";
import { NamedNodeLexer } from "./NamedNodeLexer";
import { State } from "../ast/State";

/**
 * Detects a State.
 * 
 * @author Thiago Delgado Pinto
 */
export class StateLexer extends NamedNodeLexer< State > {
    
        constructor( words: Array< string > ) {
            super( words, Keywords.STATE );
        }
    
    }