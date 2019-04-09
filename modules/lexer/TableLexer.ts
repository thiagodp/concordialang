import { Table } from "concordialang-types/ast";
import { NamedNodeLexer } from "./NamedNodeLexer";
import { NodeTypes } from "../req/NodeTypes";

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