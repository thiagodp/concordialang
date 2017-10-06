import { NamedNodeLexer } from "./NamedNodeLexer";
import { NodeTypes } from "../req/NodeTypes";
import { Table } from "../ast/Table";

/**
 * Detects a Table.
 * 
 * @author Thiago Delgado Pinto
 */
export class TableLexer extends NamedNodeLexer< Table > {

    constructor( words: string[] ) {
        super( words, NodeTypes.TABLE );
    }

}