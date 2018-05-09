"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntaticException_1 = require("../req/SyntaticException");
/**
 * TableRow parser.
 *
 * @author Thiago Delgado Pinto
 */
class TableRowParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        if (!context.inTable || !context.currentTable) {
            let e = new SyntaticException_1.SyntaticException('A table row should be declared after a Table declaration.', node.location);
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
exports.TableRowParser = TableRowParser;
//# sourceMappingURL=TableRowParser.js.map