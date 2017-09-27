import { NamedNodeLexer } from "./NamedNodeLexer";
import { TokenTypes } from "../req/TokenTypes";
import { Scenario } from "../ast/Scenario";

/**
 * Detects a Scenario.
 * 
 * @author Thiago Delgado Pinto
 */
export class ScenarioLexer extends NamedNodeLexer< Scenario > {

    constructor( words: Array< string > ) {
        super( words, TokenTypes.SCENARIO );
    }

}