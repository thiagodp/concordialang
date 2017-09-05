import { Import } from '../ast/Import';
import { QuotedNodeLexer } from './QuotedNodeLexer';
import { Keywords } from "../Keywords";

/**
 * Detects an Import.
 * 
 * @author Thiago Delgado Pinto
 */
export class ImportLexer extends QuotedNodeLexer< Import > {

    constructor( words: Array< string > ) {
        super( words, Keywords.IMPORT );
    }

}