import { Warning } from '../error/Warning';
import { Expressions } from '../req/Expressions';
import { LineChecker } from '../req/LineChecker';
import { CommentHandler } from './CommentHandler';
/**
 * Detects a node in the format "keyword anything".
 *
 * @author Thiago Delgado Pinto
 */
export class StartingKeywordLexer {
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
            + Expressions.AT_LEAST_ONE_SPACE_OR_TAB_OR_COMMA
            + '(' + Expressions.ANYTHING + ')';
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        let exp = new RegExp(this.makeRegexForTheWords(this._words), "iu");
        let result = exp.exec(line);
        if (!result) {
            return null;
        }
        const commentHandler = new CommentHandler();
        let value = commentHandler.removeComment(result[1]);
        let content = commentHandler.removeComment(line);
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
            let w = new Warning('Value is empty', node.location);
            warnings.push(w);
        }
        return { nodes: [node], errors: [], warnings: warnings };
    }
}
