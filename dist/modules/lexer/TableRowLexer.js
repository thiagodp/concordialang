"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expressions_1 = require("../req/Expressions");
const LexicalException_1 = require("./LexicalException");
const NodeTypes_1 = require("../req/NodeTypes");
const Symbols_1 = require("../req/Symbols");
/**
 * TableRow lexer.
 *
 * @author Thiago Delgado Pinto
 */
class TableRowLexer {
    /** @inheritDoc */
    nodeType() {
        return NodeTypes_1.NodeTypes.TABLE_ROW;
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.TABLE_ROW];
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        if (line.trimLeft().startsWith(Symbols_1.Symbols.COMMENT_PREFIX)) {
            return null;
        }
        // Replace empty cells with cells with a space, in order to capture their value correctly.
        // That is, "||"" with "| |".
        line = line.replace(new RegExp(Expressions_1.Expressions.escape(Symbols_1.Symbols.TABLE_CELL_SEPARATOR + Symbols_1.Symbols.TABLE_CELL_SEPARATOR), 'g'), Symbols_1.Symbols.TABLE_CELL_SEPARATOR + ' ' + Symbols_1.Symbols.TABLE_CELL_SEPARATOR);
        let index = line.indexOf(Symbols_1.Symbols.TABLE_PREFIX);
        if (index < 0) {
            return null;
        }
        let lastIndex = line.lastIndexOf(Symbols_1.Symbols.TABLE_PREFIX);
        if (lastIndex == index) {
            return null;
        }
        // Captures the content between table prefixes
        const content = line.substring(index + Symbols_1.Symbols.TABLE_PREFIX.length, lastIndex - Symbols_1.Symbols.TABLE_PREFIX.length);
        // The cells are trimmed
        const cells = content.split(Symbols_1.Symbols.TABLE_CELL_SEPARATOR).map(value => value.trim());
        const location = { column: index, line: lineNumber };
        let errors = [];
        if (cells.length < 1) {
            errors.push(new LexicalException_1.LexicalException('Invalid table row declaration: "' + line + '".', location));
        }
        let node = {
            nodeType: NodeTypes_1.NodeTypes.TABLE_ROW,
            location: location,
            cells: cells
        };
        return { nodes: [node], errors: errors };
    }
}
exports.TableRowLexer = TableRowLexer;
