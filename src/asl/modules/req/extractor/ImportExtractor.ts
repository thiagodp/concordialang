import { Import } from '../../req/ast/Import';
import { QuoteBasedExtractor } from './QuoteBasedExtractor';
import { Keywords } from "./Keywords";

export class ImportExtractor extends QuoteBasedExtractor< Import > {

    constructor( words: Array< string > ) {
        super( words, Keywords.IMPORT );
    }

}