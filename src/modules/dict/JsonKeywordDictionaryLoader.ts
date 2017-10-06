import { KeywordDictionaryLoader } from "./KeywordDictionaryLoader";
import { KeywordDictionary } from './KeywordDictionary';
import { LanguageBasedJsonFileLoader } from "../util/LanguageBasedJsonFileLoader";

import path = require( 'path' );

/**
 * JSON keyword dictionary loader.
 * 
 * @author  Thiago Delgado Pinto
 */
export class JsonKeywordDictionaryLoader
    extends LanguageBasedJsonFileLoader
    implements KeywordDictionaryLoader {

    /**
     * Constructs the loader.
     * 
     * @param dictMap Map with each language ( string => KeywordDictionary ). Defaults to {}.
     * @param dir Path of the files. Defaults to 'data/keywords'.
     * @param encoding File encoding. Defaults to 'utf8'.
     */
    constructor(
        private dictMap: Object = {},
        private dir: string = path.join( process.cwd(), 'data/keywords/' ),
        private encoding: string = 'utf8'
    ) {
        super( dictMap, dir, encoding );
    }

    /**
     * @inheritDoc
     */
    public load( language: string ): KeywordDictionary {
        return super.load( language ) as KeywordDictionary;
    }

}