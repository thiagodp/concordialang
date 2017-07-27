import { Import } from '../ast/Import';
import { QuotedNodeParser } from './QuotedNodeParser';
import { Keywords } from "./Keywords";

/**
 * Parses an Import.
 */
export class ImportParser extends QuotedNodeParser< Import > {

    constructor( words: Array< string > ) {
        super( words, Keywords.IMPORT );
    }

}