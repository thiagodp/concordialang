import { NamedNodeParser } from "./NamedNodeParser";
import { Keywords } from "./Keywords";
import { Scenario } from "../ast/Scenario";

/**
 * Parses a Scenario.
 */
export class ScenarioParser extends NamedNodeParser< Scenario > {

    constructor( words: Array< string > ) {
        super( words, Keywords.SCENARIO );
    }

}