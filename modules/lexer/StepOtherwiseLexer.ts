import { StepOtherwise } from '../ast/Step';
import { NodeTypes } from "../req/NodeTypes";
import { StartingKeywordLexer } from './StartingKeywordLexer';

/**
 * Detects an Otherwise node.
 *
 * @author Thiago Delgado Pinto
 */
export class StepOtherwiseLexer extends StartingKeywordLexer< StepOtherwise > {

    constructor( words: string[] ) {
        super( words, NodeTypes.STEP_OTHERWISE );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_AND ];
    }

}