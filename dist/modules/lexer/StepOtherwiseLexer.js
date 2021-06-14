import { NodeTypes } from "../req/NodeTypes";
import { StartingKeywordLexer } from './StartingKeywordLexer';
/**
 * Detects an Otherwise node.
 *
 * @author Thiago Delgado Pinto
 */
export class StepOtherwiseLexer extends StartingKeywordLexer {
    constructor(words) {
        super(words, NodeTypes.STEP_OTHERWISE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.STEP_AND];
    }
}
