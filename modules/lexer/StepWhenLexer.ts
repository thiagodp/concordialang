import { StepWhen } from "../ast/Step";
import { NodeTypes } from "../req/NodeTypes";
import { StartingKeywordLexer } from './StartingKeywordLexer';

/**
 * Detects a When node.
 *
 * @author Thiago Delgado Pinto
 */
export class StepWhenLexer extends StartingKeywordLexer< StepWhen > {

    constructor( words: string[] ) {
        super( words, NodeTypes.STEP_WHEN );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_AND, NodeTypes.STEP_THEN ];
    }

}