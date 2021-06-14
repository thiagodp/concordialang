import { Expressions } from '../req/Expressions';
import { LineChecker } from '../req/LineChecker';
import { Symbols } from '../req/Symbols';
import { CommentHandler } from './CommentHandler';
import { LexicalException } from './LexicalException';
/**
 * Detects a node in the format "keyword:".
 *
 * @author Thiago Delgado Pinto
 */
export class BlockLexer {
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
    makeRegexForTheWords(words) {
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(' + words.join('|') + ')'
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + this._separator
            + Expressions.OPTIONAL_SPACES_OR_TABS;
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        let exp = new RegExp(this.makeRegexForTheWords(this._words), "iu");
        let result = exp.exec(line);
        if (!result) {
            return null;
        }
        let content = (new CommentHandler()).removeComment(line);
        let pos = this._lineChecker.countLeftSpacesAndTabs(line);
        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 }
        };
        let errors = [];
        let contentAfterSeparator = this._lineChecker.textAfterSeparator(this._separator, content);
        if (contentAfterSeparator.length != 0) {
            let loc = { line: lineNumber || 0, column: line.indexOf(contentAfterSeparator) + 1 };
            let msg = 'Invalid content after the ' + this._nodeType + ': "' + contentAfterSeparator + '".';
            errors.push(new LexicalException(msg, loc));
        }
        return { nodes: [node], errors: errors };
    }
}
