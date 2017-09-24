import { StartingKeywordLexer } from './StartingKeywordLexer';
import { StepThen } from "../ast/Step";
import { Keywords } from "../req/Keywords";

/**
 * Detects a Then node.
 * 
 * @author Thiago Delgado Pinto
 */
export class StepThenLexer extends StartingKeywordLexer< StepThen > {

    constructor( words: string[] ) {
        super( words, Keywords.STEP_THEN );
    }

}