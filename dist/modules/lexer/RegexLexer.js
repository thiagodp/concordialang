"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegexLexer = void 0;
const NodeTypes_1 = require("../req/NodeTypes");
const LineChecker_1 = require("../req/LineChecker");
const Expressions_1 = require("../req/Expressions");
const Symbols_1 = require("../req/Symbols");
const LexicalException_1 = require("./LexicalException");
const CommentHandler_1 = require("./CommentHandler");
/**
 * Detects a Regex.
 *
 * @author Thiago Delgado Pinto
 */
class RegexLexer {
    constructor(_words) {
        this._words = _words;
        this._lineChecker = new LineChecker_1.LineChecker();
        this._nodeType = NodeTypes_1.NodeTypes.REGEX;
    }
    /** @inheritDoc */
    nodeType() {
        return this._nodeType;
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.REGEX];
    }
    /** @inheritDoc */
    affectedKeyword() {
        return NodeTypes_1.NodeTypes.IS;
    }
    /** @inheritDoc */
    updateWords(words) {
        this._words = words;
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        // - "foo" is "bar"
        let result = new RegExp(this.makeRegexForTheWords(this._words), 'ui').exec(line);
        if (!result) {
            return null;
        }
        // Not let's get the values inside quotes
        const regex = /(["'])(?:(?=(\\?))\2.)*?\1/g;
        let m;
        let values = [];
        while ((m = regex.exec(line)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            // Add the value
            m.forEach((match, groupIndex) => {
                if (match && match.trim().length > 1) {
                    values.push(match);
                }
            });
        }
        if (values.length < 1) {
            return null;
        }
        // Let's extract the interesting parts
        let pos = this._lineChecker.countLeftSpacesAndTabs(line);
        let name = values[0]
            .replace(new RegExp(Symbols_1.Symbols.VALUE_WRAPPER, 'g'), '') // replace all '"' with ''
            .trim();
        let value = values[1];
        // Removes the wrapper of the content, if the wrapper exists
        let firstWrapperIndex = value.indexOf(Symbols_1.Symbols.VALUE_WRAPPER);
        if (firstWrapperIndex >= 0) {
            let lastWrapperIndex = value.lastIndexOf(Symbols_1.Symbols.VALUE_WRAPPER);
            if (firstWrapperIndex != lastWrapperIndex) {
                value = value.substring(firstWrapperIndex + 1, lastWrapperIndex);
            }
        }
        let content = (new CommentHandler_1.CommentHandler()).removeComment(line);
        content = this._lineChecker.textAfterSeparator(Symbols_1.Symbols.LIST_ITEM_PREFIX, content).trim();
        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: content,
            name: name,
            value: value
        };
        let errors = [];
        if (0 == name.length) {
            let msg = this._nodeType + ' cannot have an empty name.';
            errors.push(new LexicalException_1.LexicalException(msg, node.location));
        }
        return { nodes: [node], errors: errors };
    }
    makeRegexForTheWords(words) {
        return '^' + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS
            + Symbols_1.Symbols.LIST_ITEM_PREFIX // -
            + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions_1.Expressions.SOMETHING_INSIDE_QUOTES
            + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS
            + '(?:' + words.join('|') + ')' // is
            + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS
            + '(' + Expressions_1.Expressions.SOMETHING_INSIDE_QUOTES + ')'
            + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS;
    }
}
exports.RegexLexer = RegexLexer;
