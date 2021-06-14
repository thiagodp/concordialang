import { Expressions } from "../req/Expressions";
import { LineChecker } from "../req/LineChecker";
import { Symbols } from "../req/Symbols";
import { CommentHandler } from './CommentHandler';
import { LexicalException } from "./LexicalException";
/**
 * Detects a node with the format "- anything".
 *
 * @author Thiago Delgado Pinto
 */
export class ListItemLexer {
    constructor(_nodeType) {
        this._nodeType = _nodeType;
        this._symbol = Symbols.LIST_ITEM_PREFIX;
        this._lineChecker = new LineChecker();
    }
    makeRegex() {
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + this._symbol
            + Expressions.ANYTHING;
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
    analyze(line, lineNumber) {
        let exp = new RegExp(this.makeRegex(), "u");
        let result = exp.exec(line);
        if (!result) {
            return null;
        }
        let content = (new CommentHandler()).removeComment(line);
        content = this._lineChecker.textAfterSeparator(this._symbol, content).trim();
        let pos = this._lineChecker.countLeftSpacesAndTabs(line);
        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: content
        };
        let errors = [];
        if (0 === content.length) {
            let msg = 'Empty content in ' + this._nodeType + '.';
            errors.push(new LexicalException(msg, node.location));
        }
        return { nodes: [node], errors: errors };
    }
}
