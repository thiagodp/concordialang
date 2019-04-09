import { StepGiven } from "concordialang-types/ast";
import { StartingKeywordLexer } from './StartingKeywordLexer';
import { NodeTypes } from "../req/NodeTypes";

/**
 * Detects a Given node.
 *
 * @author Thiago Delgado Pinto
 */
export class StepGivenLexer extends StartingKeywordLexer< StepGiven > {

    constructor( words: string[] ) {
        super( words, NodeTypes.STEP_GIVEN );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_AND, NodeTypes.STEP_WHEN, NodeTypes.STEP_THEN ];
    }

}