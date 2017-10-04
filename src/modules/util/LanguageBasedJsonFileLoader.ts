import { InputFileExtractor } from '../util/InputFileExtractor';

var fs = require( 'fs' );

/**
 * Language-based JSON file loader.
 * 
 * @author  Thiago Delgado Pinto
 */
export class LanguageBasedJsonFileLoader {

    /**
     * Constructs the loader.
     * 
     * @param _dictMap Map with each language ( string => object | array ). Defaults to {}.
     * @param _path Path of the files. Defaults to './data/'.
     * @param _encoding File encoding. Defaults to 'utf8'.
     */
    constructor(
        private _dictMap: Object = {},
        private _path: string = './data/',
        private _encoding: string = 'utf8'
    ) {
    }

    /**
     * Loads, caches and returns a content for the given language.
     * If the language was already used, just returns its cached content.
     * 
     * @param language Language
     * @returns The content.
     * 
     * @throws Error If cannot load the file.
     */
    public load( language: string ): any {

        // Returns the content in cache, if available
        if ( this._dictMap[ language ] ) {
            return this._dictMap[ language ];
        }

        let filePath = this.makeLanguageFilePath( language );
        let fileExists = 0 === ( new InputFileExtractor() ).nonExistentFiles( [ filePath ] ).length;
        if ( ! fileExists ) {
            throw new Error( 'File not found: ' + filePath );
        }

        return this._dictMap[ language ] = JSON.parse( this.readFileContent( filePath ) );
    }

    private makeLanguageFilePath( language: string ): string {
        return this._path + language + '.json';
    }

    private readFileContent( path ): string {
        return fs.readFileSync( path, this._encoding );
    }

}