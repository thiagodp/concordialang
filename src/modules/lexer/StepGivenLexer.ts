import { StartingKeywordLexer } from './StartingKeywordLexer';
import { StepGiven } from "../ast/Step";
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

}