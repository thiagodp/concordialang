import { StartingKeywordLexer } from './StartingKeywordLexer';
import { StepAnd } from "../ast/Step";
import { Keywords } from "../req/Keywords";

/**
 * Detects an And node.
 * 
 * @author Thiago Delgado Pinto
 */
export class StepAndLexer extends StartingKeywordLexer< StepAnd > {

    constructor( words: string[] ) {
        super( words, Keywords.STEP_AND );
    }

}