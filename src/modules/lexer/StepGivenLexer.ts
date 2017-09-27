import { StartingKeywordLexer } from './StartingKeywordLexer';
import { StepGiven } from "../ast/Step";
import { TokenTypes } from "../req/TokenTypes";

/**
 * Detects a Given node.
 * 
 * @author Thiago Delgado Pinto
 */
export class StepGivenLexer extends StartingKeywordLexer< StepGiven > {

    constructor( words: string[] ) {
        super( words, TokenTypes.STEP_GIVEN );
    }

}