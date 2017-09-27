import { StartingKeywordLexer } from './StartingKeywordLexer';
import { StepThen } from "../ast/Step";
import { TokenTypes } from "../req/TokenTypes";

/**
 * Detects a Then node.
 * 
 * @author Thiago Delgado Pinto
 */
export class StepThenLexer extends StartingKeywordLexer< StepThen > {

    constructor( words: string[] ) {
        super( words, TokenTypes.STEP_THEN );
    }

}