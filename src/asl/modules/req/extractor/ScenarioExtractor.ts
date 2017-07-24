import { NameBasedExtractor } from "./NameBasedExtractor";
import { Keywords } from "./Keywords";
import { Scenario } from "../ast/Scenario";

export class ScenarioExtractor extends NameBasedExtractor< Scenario > {

    constructor( words: Array< string > ) {
        super( words, Keywords.SCENARIO );
    }

}