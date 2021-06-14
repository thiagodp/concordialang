const XRegExp = require('xregexp');
import { Expressions } from '../req/Expressions';
import { LineChecker } from '../req/LineChecker';
import { Symbols } from "../req/Symbols";
import { CommentHandler } from './CommentHandler';
import { LexicalException } from "./LexicalException";
/**
 * Detects a node in the format "keyword "value"".
 *
 * @author Thiago Delgado Pinto
 */
export class QuotedNodeLexer {
    constructor(_words, _nodeType) {
        this._words = _words;
        this._nodeType = _nodeType;
        this._lineChecker = new LineChecker();
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
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(?:' + words.join('|') + ')'
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions.SOMETHING_INSIDE_QUOTES
            + Expressions.OPTIONAL_SPACES_OR_TABS;
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        let exp = new RegExp(this.makeRegexForTheWords(this._words), "iu");
        let result = exp.exec(line);
        if (!result) {
            return null;
        }
        let value = (new CommentHandler()).removeComment(line);
        value = this._lineChecker
            .textAfterSeparator(Symbols.VALUE_WRAPPER, value)
            .replace(new RegExp(Symbols.VALUE_WRAPPER, 'g'), '') // replace all '"' with ''
            .trim();
        let pos = this._lineChecker.countLeftSpacesAndTabs(line);
        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            value: value
        };
        let errors = [];
        if (!this.isValidName(value)) {
            let loc = { line: lineNumber || 0, column: line.indexOf(value) + 1 };
            let msg = 'Invalid ' + this._nodeType + ': "' + value + '"';
            errors.push(new LexicalException(msg, loc));
        }
        return { nodes: [node], errors: errors };
    }
    /**
     * Returns true if the given name is a valid one.
     *
     * @param name Name
     */
    isValidName(name) {
        return XRegExp('^[\\p{L}][\\p{L}0-9 ._-]*$', 'ui').test(name); // TO-DO: improve the regex
    }
}
