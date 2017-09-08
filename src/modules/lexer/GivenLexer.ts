import { StartingKeywordLexer } from './StartingKeywordLexer';
import { GivenNode } from "../ast/Scenario";
import { Keywords } from "../req/Keywords";

/**
 * Detects a Given node.
 * 
 * @author Thiago Delgado Pinto
 */
export class GivenLexer extends StartingKeywordLexer< GivenNode > {

    constructor( words: string[] ) {
        super( words, Keywords.STEP_GIVEN );
    }

}