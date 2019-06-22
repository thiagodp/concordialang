import { Table } from "../ast/Table";
import { NodeTypes } from "../req/NodeTypes";
import { NamedNodeLexer } from "./NamedNodeLexer";

/**
 * Detects a Table.
 *
 * @author Thiago Delgado Pinto
 */
export class TableLexer extends NamedNodeLexer< Table > {

    constructor( words: string[] ) {
        super( words, NodeTypes.TABLE );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.TABLE_ROW ];
    }

}