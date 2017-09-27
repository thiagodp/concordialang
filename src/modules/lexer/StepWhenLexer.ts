import { StartingKeywordLexer } from './StartingKeywordLexer';
import { StepWhen } from "../ast/Step";
import { TokenTypes } from "../req/TokenTypes";

/**
 * Detects a When node.
 * 
 * @author Thiago Delgado Pinto
 */
export class StepWhenLexer extends StartingKeywordLexer< StepWhen > {

    constructor( words: string[] ) {
        super( words, TokenTypes.STEP_WHEN );
    }

}