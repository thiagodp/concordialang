import { KeywordDictionaryLoader } from "./KeywordDictionaryLoader";
import { KeywordDictionary } from './KeywordDictionary';
import { InputFileExtractor } from '../../util/InputFileExtractor';

var fs = require( 'fs' );

/**
 * JSON keyword dictionary loader.
 * 
 * @author  Thiago Delgado Pinto
 */
export class JsonKeywordDictionaryLoader implements KeywordDictionaryLoader {

    /**
     * Constructs the loader.
     * 
     * @param _basePath Path where there is a "dict" folder when the dictionaries. Defaults to './'.
     * @param _dictMap Map with each language ( string => KeywordDictionary ). Defaults to {}.
     * @param _encoding Dictionary file encoding. Defaults to 'utf8'.
     */
    constructor(
        private _basePath: string = './',
        private _dictMap: Object = {},
        private _encoding: string = 'utf8'
    ) {
    }

    /**
     * @inheritDoc
     */
    public load( language: string ): KeywordDictionary {

        // Returns the content in cache, if available
        if ( this._dictMap[ language ] ) {
            return this._dictMap[ language ];
        }

        let filePath = this.makeLanguageFilePath( language );
        let fileExists = 0 === ( new InputFileExtractor() ).nonExistentFiles( [ filePath ] ).length;
        if ( ! fileExists ) {
            throw new Error( 'Cannot load language "' + language + '". File "' + filePath + '" not found.' );
        }

        return this._dictMap[ language ] = JSON.parse( this.readFileContent( filePath ) );
    }

    private makeLanguageFilePath( language: string ): string {
        return this._basePath + 'dict/' + language + '.json';
    }

    private readFileContent( path ): string {
        return fs.readFileSync( path, this._encoding );
    }

}