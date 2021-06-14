import isValidPath from 'is-valid-path';
import { NodeTypes } from '../req/NodeTypes';
import { QuotedNodeLexer } from './QuotedNodeLexer';
/**
 * Detects an Import.
 *
 * @author Thiago Delgado Pinto
 */
export class ImportLexer extends QuotedNodeLexer {
    constructor(words) {
        super(words, NodeTypes.IMPORT);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.FEATURE, NodeTypes.VARIANT];
    }
    /** @inheritdoc */
    isValidName(name) {
        return isValidPath(name);
    }
}
