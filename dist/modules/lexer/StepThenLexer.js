import { NodeTypes } from "../req/NodeTypes";
import { StartingKeywordLexer } from './StartingKeywordLexer';
/**
 * Detects a Then node.
 *
 * @author Thiago Delgado Pinto
 */
export class StepThenLexer extends StartingKeywordLexer {
    constructor(words) {
        super(words, NodeTypes.STEP_THEN);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_AND];
    }
}
