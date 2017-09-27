import { Import } from '../ast/Import';
import { QuotedNodeLexer } from './QuotedNodeLexer';
import { TokenTypes } from "../req/TokenTypes";

/**
 * Detects an Import.
 * 
 * @author Thiago Delgado Pinto
 */
export class ImportLexer extends QuotedNodeLexer< Import > {

    constructor( words: Array< string > ) {
        super( words, TokenTypes.IMPORT );
    }

}