"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LongStringLexer = void 0;
const NodeTypes_1 = require("../req/NodeTypes");
const Symbols_1 = require("../req/Symbols");
/**
 * Detects anything not empty.
 *
 * @author Thiago Delgado Pinto
 */
class LongStringLexer {
    /** @inheritDoc */
    nodeType() {
        return NodeTypes_1.NodeTypes.LONG_STRING;
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.LONG_STRING];
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        // Empty line is not accepted
        if (0 === line.trim().length) {
            return null;
        }
        // It must start with three quotes ("""), exactly. It may have spaces
        let re = new RegExp('^""" *(' + Symbols_1.Symbols.COMMENT_PREFIX + '.*)?$', 'u');
        if (!re.test(line)) {
            return null;
        }
        let node = {
            nodeType: NodeTypes_1.NodeTypes.LONG_STRING,
            location: { line: lineNumber || 0, column: 1 }
        };
        return { nodes: [node], errors: [] };
    }
}
exports.LongStringLexer = LongStringLexer;
