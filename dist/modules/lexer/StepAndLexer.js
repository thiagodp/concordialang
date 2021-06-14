import { NodeTypes } from "../req/NodeTypes";
import { StartingKeywordLexer } from './StartingKeywordLexer';
/**
 * Detects an And node.
 *
 * @author Thiago Delgado Pinto
 */
export class StepAndLexer extends StartingKeywordLexer {
    constructor(words) {
        super(words, NodeTypes.STEP_AND);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_AND, NodeTypes.STEP_WHEN, NodeTypes.STEP_THEN];
    }
}
