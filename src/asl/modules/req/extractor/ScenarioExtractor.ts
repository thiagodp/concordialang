import { NameBasedExtractor } from "./NameBasedExtractor";
import { TokenTypes } from "./TokenTypes";
import { Scenario } from "../ast/Scenario";

export class ScenarioExtractor extends NameBasedExtractor< Scenario > {

    constructor( words: Array< string > ) {
        super( words, TokenTypes.SCENARIO );
    }

}