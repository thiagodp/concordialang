import { StepAnd } from "concordialang-types/ast";
import { StartingKeywordLexer } from './StartingKeywordLexer';
import { NodeTypes } from "../req/NodeTypes";

/**
 * Detects an And node.
 *
 * @author Thiago Delgado Pinto
 */
export class StepAndLexer extends StartingKeywordLexer< StepAnd > {

    constructor( words: string[] ) {
        super( words, NodeTypes.STEP_AND );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_AND, NodeTypes.STEP_WHEN, NodeTypes.STEP_THEN ];
    }

}