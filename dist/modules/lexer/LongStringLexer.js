import { NodeTypes } from '../req/NodeTypes';
import { Symbols } from '../req/Symbols';
/**
 * Detects anything not empty.
 *
 * @author Thiago Delgado Pinto
 */
export class LongStringLexer {
    /** @inheritDoc */
    nodeType() {
        return NodeTypes.LONG_STRING;
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.LONG_STRING];
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        // Empty line is not accepted
        if (0 === line.trim().length) {
            return null;
        }
        // It must start with three quotes ("""), exactly. It may have spaces
        let re = new RegExp('^""" *(' + Symbols.COMMENT_PREFIX + '.*)?$', 'u');
        if (!re.test(line)) {
            return null;
        }
        let node = {
            nodeType: NodeTypes.LONG_STRING,
            location: { line: lineNumber || 0, column: 1 }
        };
        return { nodes: [node], errors: [] };
    }
}
