import { KeywordDictionary } from './KeywordDictionary';
import { KeywordDictionaryLoader } from './KeywordDictionaryLoader';

/**
 * In memory keyword dictionary loader.
 * 
 * @author  Thiago Delgado Pinto
 */
export class InMemoryKeywordDictionaryLoader implements KeywordDictionaryLoader {

    /**
     * Constructs the loader.
     * 
     * @param _dictMap Map with each language ( string => KeywordDictionary ).
     */    
    constructor( private _dictMap: Object = {} ) {
    }

    public load( language: string ): KeywordDictionary | null {
        return this._dictMap[ language ];
    }

}