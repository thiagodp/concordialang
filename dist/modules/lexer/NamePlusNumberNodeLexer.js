import { Expressions } from '../req/Expressions';
import { NamedNodeLexer } from './NamedNodeLexer';
/**
 * Detects a node in the format "keyword number: name" (e.g. "variant 1: buy with credit card").
 *
 * @author Thiago Delgado Pinto
 */
export class NamePlusNumberNodeLexer extends NamedNodeLexer {
    constructor(_words, _nodeType) {
        super(_words, _nodeType);
    }
    makeRegexForTheWords(words) {
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(' + words.join('|') + ')'
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions.AN_INTEGER_NUMBER + '?' // optional
            + this.separator()
            + Expressions.ANYTHING; // the name
    }
}
