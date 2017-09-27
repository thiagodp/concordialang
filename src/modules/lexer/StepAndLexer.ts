import { StartingKeywordLexer } from './StartingKeywordLexer';
import { StepAnd } from "../ast/Step";
import { TokenTypes } from "../req/TokenTypes";

/**
 * Detects an And node.
 * 
 * @author Thiago Delgado Pinto
 */
export class StepAndLexer extends StartingKeywordLexer< StepAnd > {

    constructor( words: string[] ) {
        super( words, TokenTypes.STEP_AND );
    }

}