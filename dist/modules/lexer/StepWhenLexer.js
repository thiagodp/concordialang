import { NodeTypes } from "../req/NodeTypes";
import { StartingKeywordLexer } from './StartingKeywordLexer';
/**
 * Detects a When node.
 *
 * @author Thiago Delgado Pinto
 */
export class StepWhenLexer extends StartingKeywordLexer {
    constructor(words) {
        super(words, NodeTypes.STEP_WHEN);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_AND, NodeTypes.STEP_THEN];
    }
}
