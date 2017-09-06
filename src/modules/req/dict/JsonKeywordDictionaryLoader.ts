import { KeywordDictionaryLoader } from "./KeywordDictionaryLoader";
import { KeywordDictionary } from './KeywordDictionary';
import { InputFileExtractor } from '../../util/InputFileExtractor';

/**
 * JSON keyword dictionary loader.
 * 
 * @author  Thiago Delgado Pinto
 */
export class JsonKeywordDictionaryLoader implements KeywordDictionaryLoader {

    /**
     * Constructs the loader.
     * 
     * @param _basePath Path where there is a "dict" folder when the dictionaries.
     * @param _dictMap Map with each language ( string => KeywordDictionary ).
     */
    constructor( private _basePath: string = './', private _dictMap: Object = {} ) {
    }

    /**
     * @inheritDoc
     */
    public load( language: string ): KeywordDictionary | null {

        // Returns the content in cache, if available
        if ( this._dictMap[ language ] ) {
            return this._dictMap[ language ];
        }

        let filePath = this.makeLanguageFilePath( language );
        let fileExists = 0 === ( new InputFileExtractor() ).nonExistentFiles( [ filePath ] ).length;
        if ( ! fileExists ) {
            return null;
        }

        // require is synchronous and cacheable
        return this._dictMap[ language ] = require( filePath ) as KeywordDictionary;
    }

    private makeLanguageFilePath( language: string ): string {
        return this._basePath + 'dict/' + language + '.json';
    }

}