import { LineChecker } from "../req/LineChecker";
import { NodeTypes } from '../req/NodeTypes';
import { Symbols } from '../req/Symbols';
/**
 * Detects anything not empty.
 *
 * @author Thiago Delgado Pinto
 */
export class TextLexer {
    constructor() {
        this._lineChecker = new LineChecker();
    }
    /** @inheritDoc */
    nodeType() {
        return NodeTypes.TEXT;
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.TEXT];
    }
    /** @inheritDoc */
    analyze(line, lineNumber) {
        let trimmedLine = line.trim();
        // Empty line is not accepted
        if (0 === trimmedLine.length) {
            return null;
        }
        // Comment is not accepted
        const commentPos = trimmedLine.indexOf(Symbols.COMMENT_PREFIX);
        if (0 === commentPos) {
            return null;
        }
        const pos = this._lineChecker.countLeftSpacesAndTabs(line);
        let node = {
            nodeType: NodeTypes.TEXT,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: line
        };
        return { nodes: [node], errors: [] };
    }
}
