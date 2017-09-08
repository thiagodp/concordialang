import { StartingKeywordLexer } from './StartingKeywordLexer';
import { AndNode } from "../ast/Scenario";
import { Keywords } from "../req/Keywords";

/**
 * Detects an And node.
 * 
 * @author Thiago Delgado Pinto
 */
export class AndLexer extends StartingKeywordLexer< AndNode > {

    constructor( words: string[] ) {
        super( words, Keywords.STEP_AND );
    }

}