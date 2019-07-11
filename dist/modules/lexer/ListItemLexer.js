"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expressions_1 = require("../req/Expressions");
const Symbols_1 = require("../req/Symbols");
const LineChecker_1 = require("../req/LineChecker");
const LexicalException_1 = require("./LexicalException");
const CommentHandler_1 = require("./CommentHandler");
/**
 * Detects a node with the format "- anything".
 *
 * @author Thiago Delgado Pinto
 */
class ListItemLexer {
    constructor(_nodeType) {
        this._nodeType = _nodeType;
        this._symbol = Symbols_1.Symbols.LIST_ITEM_PREFIX;
        this._lineChecker = new LineChecker_1.LineChecker();
    }
    makeRegex() {
        return '^' + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS
            + this._symbol
            + Expressions_1.Expressions.ANYTHING;
    }
    /** @inheritDoc */
    nodeType() {
        return this._nodeType;
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [];
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        let exp = new RegExp(this.makeRegex(), "u");
        let result = exp.exec(line);
        if (!result) {
            return null;
        }
        let content = (new CommentHandler_1.CommentHandler()).removeComment(line);
        content = this._lineChecker.textAfterSeparator(this._symbol, content).trim();
        let pos = this._lineChecker.countLeftSpacesAndTabs(line);
        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: content
        };
        let errors = [];
        if (0 === content.length) {
            let msg = 'Empty content in ' + this._nodeType + '.';
            errors.push(new LexicalException_1.LexicalException(msg, node.location));
        }
        return { nodes: [node], errors: errors };
    }
}
exports.ListItemLexer = ListItemLexer;
