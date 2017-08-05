import { NamedNodeLexer } from "./NamedNodeLexer";
import { Keywords } from "../Keywords";
import { Scenario } from "../old_ast/Scenario";

/**
 * Detects a Scenario.
 * 
 * @author Thiago Delgado Pinto
 */
export class ScenarioLexer extends NamedNodeLexer< Scenario > {

    constructor( words: Array< string > ) {
        super( words, Keywords.SCENARIO );
    }

}