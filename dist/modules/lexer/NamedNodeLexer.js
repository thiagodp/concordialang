import { Expressions } from '../req/Expressions';
import { LineChecker } from '../req/LineChecker';
import { Symbols } from '../req/Symbols';
import { CommentHandler } from './CommentHandler';
import { LexicalException } from './LexicalException';
const XRegExp = require('xregexp');
/**
 * Detects a node in the format "keyword: name".
 *
 * @author Thiago Delgado Pinto
 */
export class NamedNodeLexer {
    constructor(_words, _nodeType) {
        this._words = _words;
        this._nodeType = _nodeType;
        this._separator = Symbols.TITLE_SEPARATOR;
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
    separator() {
        return this._separator;
    }
    makeRegexForTheWords(words) {
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(' + words.join('|') + ')'
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + this._separator
            + Expressions.ANYTHING; // the name
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        let exp = new RegExp(this.makeRegexForTheWords(this._words), "iu");
        let result = exp.exec(line);
        if (!result) {
            return null;
        }
        let pos = this._lineChecker.countLeftSpacesAndTabs(line);
        let name = (new CommentHandler()).removeComment(line);
        name = this._lineChecker.textAfterSeparator(this._separator, name).trim();
        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            name: name
        };
        let errors = [];
        if (!this.isValidName(name)) {
            let loc = { line: lineNumber || 0, column: line.indexOf(name) + 1 };
            let msg = 'Invalid ' + this._nodeType + ' name: "' + name + '"';
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
