"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageLexer = void 0;
const Expressions_1 = require("../req/Expressions");
const NodeTypes_1 = require("../req/NodeTypes");
const Symbols_1 = require("../req/Symbols");
const LineChecker_1 = require("../req/LineChecker");
/**
 * Detects a Language.
 *
 * @author Thiago Delgado Pinto
 */
class LanguageLexer {
    constructor(_words) {
        this._words = _words;
        this._lineChecker = new LineChecker_1.LineChecker();
    }
    /** @inheritDoc */
    nodeType() {
        return NodeTypes_1.NodeTypes.LANGUAGE;
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.IMPORT, NodeTypes_1.NodeTypes.FEATURE, NodeTypes_1.NodeTypes.VARIANT];
    }
    /** @inheritDoc */
    affectedKeyword() {
        return NodeTypes_1.NodeTypes.LANGUAGE;
    }
    /** @inheritDoc */
    updateWords(words) {
        this._words = words;
    }
    makeRegexForTheWords(words) {
        return '^' + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions_1.Expressions.escape(Symbols_1.Symbols.LANGUAGE_PREFIX)
            + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS
            + '(' + words.join('|') + ')'
            + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions_1.Expressions.escape(Symbols_1.Symbols.LANGUAGE_SEPARATOR)
            + Expressions_1.Expressions.ANYTHING; // the language code
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        let exp = new RegExp(this.makeRegexForTheWords(this._words), "iu");
        let result = exp.exec(line);
        if (!result) {
            return null;
        }
        let pos = this._lineChecker.countLeftSpacesAndTabs(line);
        let value = this._lineChecker.textAfterSeparator(Symbols_1.Symbols.LANGUAGE_SEPARATOR, line).trim();
        let node = {
            nodeType: NodeTypes_1.NodeTypes.LANGUAGE,
            location: { line: lineNumber || 0, column: pos + 1 },
            value: value
        };
        return { nodes: [node], errors: [] };
    }
}
exports.LanguageLexer = LanguageLexer;
