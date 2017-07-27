import { NamedNodeParser } from "./NamedNodeParser";
import { Feature } from "../ast/Feature";
import { Keywords } from "./Keywords";

/**
 * Parses a Feature.
 */
export class FeatureParser extends NamedNodeParser< Feature > {

    constructor( words: Array< string > ) {
        super( words, Keywords.FEATURE );
    }

}