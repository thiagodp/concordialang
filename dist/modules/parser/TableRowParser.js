import { SyntacticException } from './SyntacticException';
/**
 * TableRow parser.
 *
 * @author Thiago Delgado Pinto
 */
export class TableRowParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        if (!context.inTable || !context.currentTable) {
            let e = new SyntacticException('A table row should be declared after a Table declaration.', node.location);
            errors.push(e);
            return false;
        }
        // Checks the structure
        if (!context.currentTable.rows) {
            context.currentTable.rows = [];
        }
        // Adds the node
        context.currentTable.rows.push(node);
        return true;
    }
}
