import { NameBasedExtractor } from "./NameBasedExtractor";
import { Feature } from "../ast/Feature";
import { Keywords } from "./Keywords";

export class FeatureExtractor extends NameBasedExtractor< Feature > {

    constructor( words: Array< string > ) {
        super( words, Keywords.FEATURE );
    }

}