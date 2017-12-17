import { StartingKeywordLexer } from './StartingKeywordLexer';
import { StepOtherwise } from '../ast/Step';
import { NodeTypes } from "../req/NodeTypes";

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