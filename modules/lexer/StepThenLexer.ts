import { StepThen } from "concordialang-types/ast";
import { StartingKeywordLexer } from './StartingKeywordLexer';
import { NodeTypes } from "../req/NodeTypes";

/**
 * Detects a Then node.
 *
 * @author Thiago Delgado Pinto
 */
export class StepThenLexer extends StartingKeywordLexer< StepThen > {

    constructor( words: string[] ) {
        super( words, NodeTypes.STEP_THEN );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_AND ];
    }

}