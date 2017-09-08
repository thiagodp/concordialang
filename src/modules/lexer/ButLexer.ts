import { StartingKeywordLexer } from './StartingKeywordLexer';
import { ButNode } from "../ast/Scenario";
import { Keywords } from "../req/Keywords";

/**
 * Detects a But node.
 * 
 * @author Thiago Delgado Pinto
 */
export class ButLexer extends StartingKeywordLexer< ButNode > {

    constructor( words: string[] ) {
        super( words, Keywords.STEP_BUT );
    }

}