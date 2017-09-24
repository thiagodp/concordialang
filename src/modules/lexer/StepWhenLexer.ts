import { StartingKeywordLexer } from './StartingKeywordLexer';
import { StepWhen } from "../ast/Step";
import { Keywords } from "../req/Keywords";

/**
 * Detects a When node.
 * 
 * @author Thiago Delgado Pinto
 */
export class StepWhenLexer extends StartingKeywordLexer< StepWhen > {

    constructor( words: string[] ) {
        super( words, Keywords.STEP_WHEN );
    }

}