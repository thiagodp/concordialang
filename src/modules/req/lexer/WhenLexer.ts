import { StartingKeywordLexer } from './StartingKeywordLexer';
import { WhenNode } from "../ast/Scenario";
import { Keywords } from "../Keywords";

/**
 * Detects a When node.
 * 
 * @author Thiago Delgado Pinto
 */
export class WhenLexer extends StartingKeywordLexer< WhenNode > {

    constructor( words: string[] ) {
        super( words, Keywords.STEP_WHEN );
    }

}