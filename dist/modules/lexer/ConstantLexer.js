"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LexicalException_1 = require("../req/LexicalException");
const LineChecker_1 = require("../req/LineChecker");
const NodeTypes_1 = require("../req/NodeTypes");
const Expressions_1 = require("../req/Expressions");
const Symbols_1 = require("../req/Symbols");
const CommentHandler_1 = require("./CommentHandler");
/**
 * Detects a Contant.
 *
 * @author Thiago Delgado Pinto
 */
class ConstantLexer {
    constructor(_words) {
        this._words = _words;
        this._lineChecker = new LineChecker_1.LineChecker();
        this._nodeType = NodeTypes_1.NodeTypes.CONSTANT;
    }
    /** @inheritDoc */
    nodeType() {
        return this._nodeType;
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.CONSTANT];
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
        let exp = new RegExp(this.makeRegexForTheWords(this._words), "iu");
        let result = exp.exec(line);
        if (!result) {
            return null;
        }
        let pos = this._lineChecker.countLeftSpacesAndTabs(line);
        let name = result[1]
            .replace(new RegExp(Symbols_1.Symbols.VALUE_WRAPPER, 'g'), '') // replace all '"' with ''
            .trim();
        let value = result[2];
        // Removes the wrapper of the content, if the wrapper exists
        let firstWrapperIndex = value.indexOf(Symbols_1.Symbols.VALUE_WRAPPER);
        if (firstWrapperIndex >= 0) {
            let lastWrapperIndex = value.lastIndexOf(Symbols_1.Symbols.VALUE_WRAPPER);
            if (firstWrapperIndex != lastWrapperIndex) {
                value = value.substring(firstWrapperIndex + 1, lastWrapperIndex);
            }
        }
        // Ignores comment
        let content = (new CommentHandler_1.CommentHandler()).removeComment(line);
        content = this._lineChecker.textAfterSeparator(Symbols_1.Symbols.LIST_ITEM_PREFIX, content).trim();
        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            name: name,
            value: value,
            content: content
        };
        let errors = [];
        if (0 == name.length) {
            let msg = this._nodeType + ' cannot have an empty name.';
            errors.push(new LexicalException_1.LexicalException(msg, node.location));
        }
        return { nodes: [node], errors: errors };
    }
    makeRegexForTheWords(words) {
        const regexStr = '^' + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS
            + Symbols_1.Symbols.LIST_ITEM_PREFIX // -
            + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions_1.Expressions.SOMETHING_INSIDE_QUOTES
            + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS
            + '(?:' + words.join('|') + ')' // is
            + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS
            + '(' + Expressions_1.Expressions.SOMETHING_INSIDE_QUOTES + '|' + Expressions_1.Expressions.A_NUMBER + ')'
            + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS;
        return regexStr;
    }
}
exports.ConstantLexer = ConstantLexer;
