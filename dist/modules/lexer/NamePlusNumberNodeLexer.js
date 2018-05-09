"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expressions_1 = require("../req/Expressions");
const NamedNodeLexer_1 = require("./NamedNodeLexer");
const XRegExp = require('xregexp');
/**
 * Detects a node in the format "keyword number: name" (e.g. "variant 1: buy with credit card").
 *
 * @author Thiago Delgado Pinto
 */
class NamePlusNumberNodeLexer extends NamedNodeLexer_1.NamedNodeLexer {
    constructor(_words, _nodeType) {
        super(_words, _nodeType);
    }
    makeRegexForTheWords(words) {
        return '^' + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS
            + '(' + words.join('|') + ')'
            + Expressions_1.Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions_1.Expressions.AN_INTEGER_NUMBER + '?' // optional
            + this.separator()
            + Expressions_1.Expressions.ANYTHING; // the name
    }
}
exports.NamePlusNumberNodeLexer = NamePlusNumberNodeLexer;
//# sourceMappingURL=NamePlusNumberNodeLexer.js.map