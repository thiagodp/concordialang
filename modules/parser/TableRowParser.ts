import { TableRow } from "concordialang-types";
import { SyntaticException } from '../req/SyntaticException';
import { NodeParser } from "./NodeParser";
import { ParsingContext } from "./ParsingContext";
import { NodeIterator } from './NodeIterator';

/**
 * TableRow parser.
 *
 * @author Thiago Delgado Pinto
 */
export class TableRowParser implements NodeParser< TableRow > {

    /** @inheritDoc */
    public analyze( node: TableRow, context: ParsingContext, it: NodeIterator, errors: Error[] ): boolean {

        if ( ! context.inTable || ! context.currentTable ) {
            let e = new SyntaticException(
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