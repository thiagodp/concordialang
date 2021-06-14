import { Expressions } from '../req/Expressions';
import { NodeTypes } from '../req/NodeTypes';
import { Symbols } from '../req/Symbols';
import { LexicalException } from './LexicalException';
/**
 * TableRow lexer.
 *
 * @author Thiago Delgado Pinto
 */
export class TableRowLexer {
    /** @inheritDoc */
    nodeType() {
        return NodeTypes.TABLE_ROW;
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.TABLE_ROW];
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        if (line.trimLeft().startsWith(Symbols.COMMENT_PREFIX)) {
            return null;
        }
        // Replace empty cells with cells with a space, in order to capture their value correctly.
        // That is, "||"" with "| |".
        line = line.replace(new RegExp(Expressions.escape(Symbols.TABLE_CELL_SEPARATOR + Symbols.TABLE_CELL_SEPARATOR), 'g'), Symbols.TABLE_CELL_SEPARATOR + ' ' + Symbols.TABLE_CELL_SEPARATOR);
        let index = line.indexOf(Symbols.TABLE_PREFIX);
        if (index < 0) {
            return null;
        }
        let lastIndex = line.lastIndexOf(Symbols.TABLE_PREFIX);
        if (lastIndex == index) {
            return null;
        }
        // Captures the content between table prefixes
        const content = line.substring(index + Symbols.TABLE_PREFIX.length, lastIndex - Symbols.TABLE_PREFIX.length);
        // The cells are trimmed
        const cells = content.split(Symbols.TABLE_CELL_SEPARATOR).map(value => value.trim());
        const location = { column: index, line: lineNumber };
        let errors = [];
        if (cells.length < 1) {
            errors.push(new LexicalException('Invalid table row declaration: "' + line + '".', location));
        }
        let node = {
            nodeType: NodeTypes.TABLE_ROW,
            location: location,
            cells: cells
        };
        return { nodes: [node], errors: errors };
    }
}
