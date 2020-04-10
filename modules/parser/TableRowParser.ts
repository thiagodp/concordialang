import { TableRow } from "../ast/Table";
import { NodeIterator } from './NodeIterator';
import { NodeParser } from "./NodeParser";
import { ParsingContext } from "./ParsingContext";
import { SyntacticException } from './SyntacticException';

/**
 * TableRow parser.
 *
 * @author Thiago Delgado Pinto
 */
export class TableRowParser implements NodeParser< TableRow > {

    /** @inheritDoc */
    public analyze( node: TableRow, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        if ( ! context.inTable || ! context.currentTable ) {
            let e = new SyntacticException(
                'A table row should be declared after a Table declaration.', node.location );
            errors.push( e );
            return false;
        }

        // Checks the structure
        if ( ! context.currentTable.rows ) {
            context.currentTable.rows = [];
        }

        // Adds the node
        context.currentTable.rows.push( node );

        return true;
    }

}