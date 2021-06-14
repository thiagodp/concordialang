import { NodeTypes } from "../req/NodeTypes";
import { StartingKeywordLexer } from './StartingKeywordLexer';
/**
 * Detects a Given node.
 *
 * @author Thiago Delgado Pinto
 */
export class StepGivenLexer extends StartingKeywordLexer {
    constructor(words) {
        super(words, NodeTypes.STEP_GIVEN);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_AND, NodeTypes.STEP_WHEN, NodeTypes.STEP_THEN];
    }
}
