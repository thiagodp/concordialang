import { StartingKeywordLexer } from './StartingKeywordLexer';
import { ThenNode } from "../ast/Scenario";
import { Keywords } from "../Keywords";

/**
 * Detects a Then node.
 * 
 * @author Thiago Delgado Pinto
 */
export class ThenLexer extends StartingKeywordLexer< ThenNode > {

    constructor( words: string[] ) {
        super( words, Keywords.STEP_THEN );
    }

}