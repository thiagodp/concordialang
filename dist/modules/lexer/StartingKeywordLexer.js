"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Warning_1 = require("../req/Warning");
const Symbols_1 = require("../req/Symbols");
const LineChecker_1 = require("../req/LineChecker");
const Expressions_1 = require("../req/Expressions");
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
        let value = this.removeComment(result[1].trim());
        let content = this.removeComment(line.trim());
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
    removeComment(content) {
        let commentPos = content.lastIndexOf(Symbols_1.Symbols.COMMENT_PREFIX);
        if (commentPos >= 0) {
            // If the preceding character is '<', it is not a comment
            if (commentPos > 1 && content.substr(commentPos - 1, 1) === Symbols_1.Symbols.UI_LITERAL_PREFIX) {
                return content;
            }
            return content.substring(0, commentPos).trim();
        }
        return content;
    }
}
exports.StartingKeywordLexer = StartingKeywordLexer;
//# sourceMappingURL=StartingKeywordLexer.js.map