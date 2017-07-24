import { NameBasedExtractor } from "./NameBasedExtractor";
import { Feature } from "../ast/Feature";
import { TokenTypes } from "./TokenTypes";

export class FeatureExtractor extends NameBasedExtractor< Feature > {

    constructor( words: Array< string > ) {
        super( words, TokenTypes.FEATURE );
    }

}