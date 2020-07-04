"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextLexer = void 0;
const Symbols_1 = require("../req/Symbols");
const NodeTypes_1 = require("../req/NodeTypes");
const LineChecker_1 = require("../req/LineChecker");
/**
 * Detects anything not empty.
 *
 * @author Thiago Delgado Pinto
 */
class TextLexer {
    constructor() {
        this._lineChecker = new LineChecker_1.LineChecker();
    }
    /** @inheritDoc */
    nodeType() {
        return NodeTypes_1.NodeTypes.TEXT;
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.TEXT];
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        let trimmedLine = line.trim();
        // Empty line is not accepted
        if (0 === trimmedLine.length) {
            return null;
        }
        // Comment is not accepted
        const commentPos = trimmedLine.indexOf(Symbols_1.Symbols.COMMENT_PREFIX);
        if (0 === commentPos) {
            return null;
        }
        const pos = this._lineChecker.countLeftSpacesAndTabs(line);
        let node = {
            nodeType: NodeTypes_1.NodeTypes.TEXT,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: line
        };
        return { nodes: [node], errors: [] };
    }
}
exports.TextLexer = TextLexer;
