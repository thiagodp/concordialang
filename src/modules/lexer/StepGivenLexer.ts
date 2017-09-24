import { StartingKeywordLexer } from './StartingKeywordLexer';
import { StepGiven } from "../ast/Step";
import { Keywords } from "../req/Keywords";

/**
 * Detects a Given node.
 * 
 * @author Thiago Delgado Pinto
 */
export class StepGivenLexer extends StartingKeywordLexer< StepGiven > {

    constructor( words: string[] ) {
        super( words, Keywords.STEP_GIVEN );
    }

}