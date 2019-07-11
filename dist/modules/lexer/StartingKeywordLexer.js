"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expressions_1 = require("../req/Expressions");
const LineChecker_1 = require("../req/LineChecker");
const Warning_1 = require("../error/Warning");
const CommentHandler_1 = require("./CommentHandler");
/**
 * Detects a node in the format "keyword anything".
 *
 * @author Thiago Delgado Pinto
 */
class StartingKeywordLexer {
    constructor(_words, _nodeType) {
        this._words = _words;
        this._nodeType = _nodeType;
        this._lineChecker = new LineChecker_1.LineChecker();
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
    affectedKeyword() {
        return this._nodeType;
    }
    /** @inheritDoc */
    updateWords(words) {
        this._words = words;
    }
    makeRegexForTheWords(words) {
        return '^' + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS
            + '(?:' + words.join('|') + ')'
            + Expressions_1.Expressions.AT_LEAST_ONE_SPACE_OR_TAB_OR_COMMA
            + '(' + Expressions_1.Expressions.ANYTHING + ')';
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        let exp = new RegExp(this.makeRegexForTheWords(this._words), "iu");
        let result = exp.exec(line);
        if (!result) {
            return null;
        }
        const commmentHandler = new CommentHandler_1.CommentHandler();
        let value = commmentHandler.removeComment(result[1]);
        let content = commmentHandler.removeComment(line);
        let pos = this._lineChecker.countLeftSpacesAndTabs(line);
        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: content
        };
        if ('value' in node) {
            node['value'] = value;
        }
        let warnings = [];
        if (value.length < 1) {
            let w = new Warning_1.Warning('Value is empty', node.location);
            warnings.push(w);
        }
        return { nodes: [node], errors: [], warnings: warnings };
    }
}
exports.StartingKeywordLexer = StartingKeywordLexer;
