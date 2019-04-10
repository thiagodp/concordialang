import { StepWhen } from "concordialang-types";
import { StartingKeywordLexer } from './StartingKeywordLexer';
import { NodeTypes } from "../req/NodeTypes";

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