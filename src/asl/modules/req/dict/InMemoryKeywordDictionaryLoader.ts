import { KeywordDictionary } from './KeywordDictionary';
import { KeywordDictionaryLoader } from './KeywordDictionaryLoader';

/**
 * In memory keyword dictionary loader.
 * 
 * @author  Thiago Delgado Pinto
 */
export class InMemoryKeywordDictionaryLoader implements KeywordDictionaryLoader {

    constructor( private _map: Object = {} ) {
    }

    load( language: string ): KeywordDictionary | null {
        return this._map[ language ];
    }

}