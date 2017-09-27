import { Import } from '../ast/Import';
import { QuotedNodeLexer } from './QuotedNodeLexer';
import { NodeTypes } from "../req/NodeTypes";

/**
 * Detects an Import.
 * 
 * @author Thiago Delgado Pinto
 */
export class ImportLexer extends QuotedNodeLexer< Import > {

    constructor( words: Array< string > ) {
        super( words, NodeTypes.IMPORT );
    }

}