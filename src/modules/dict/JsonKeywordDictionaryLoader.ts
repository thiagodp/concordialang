import { KeywordDictionaryLoader } from "./KeywordDictionaryLoader";
import { KeywordDictionary } from './KeywordDictionary';
import { LanguageBasedJsonFileLoader } from "../util/LanguageBasedJsonFileLoader";

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
     * @param _dictMap Map with each language ( string => KeywordDictionary ). Defaults to {}.
     * @param _path Path of the files. Defaults to './data/keywords'.
     * @param _encoding File encoding. Defaults to 'utf8'.
     */
    constructor(
        private dictMap: Object = {},
        private path: string = './data/keywords/',        
        private encoding: string = 'utf8'
    ) {
        super( dictMap, path, encoding );
    }

    /**
     * @inheritDoc
     */
    public load( language: string ): KeywordDictionary {
        return super.load( language ) as KeywordDictionary;
    }

}