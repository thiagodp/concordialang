import { Expressions } from '../req/Expressions';
import { LineChecker } from '../req/LineChecker';
import { NodeTypes } from '../req/NodeTypes';
import { Symbols } from '../req/Symbols';
/**
 * Detects a Language.
 *
 * @author Thiago Delgado Pinto
 */
export class LanguageLexer {
    constructor(_words) {
        this._words = _words;
        this._lineChecker = new LineChecker();
    }
    /** @inheritDoc */
    nodeType() {
        return NodeTypes.LANGUAGE;
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.IMPORT, NodeTypes.FEATURE, NodeTypes.VARIANT];
    }
    /** @inheritDoc */
    affectedKeyword() {
        return NodeTypes.LANGUAGE;
    }
    /** @inheritDoc */
    updateWords(words) {
        this._words = words;
    }
    makeRegexForTheWords(words) {
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions.escape(Symbols.LANGUAGE_PREFIX)
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(' + words.join('|') + ')'
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions.escape(Symbols.LANGUAGE_SEPARATOR)
            + Expressions.ANYTHING; // the language code
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        let exp = new RegExp(this.makeRegexForTheWords(this._words), "iu");
        let result = exp.exec(line);
        if (!result) {
            return null;
        }
        let pos = this._lineChecker.countLeftSpacesAndTabs(line);
        let value = this._lineChecker.textAfterSeparator(Symbols.LANGUAGE_SEPARATOR, line).trim();
        let node = {
            nodeType: NodeTypes.LANGUAGE,
            location: { line: lineNumber || 0, column: pos + 1 },
            value: value
        };
        return { nodes: [node], errors: [] };
    }
}
