import { join } from 'path';
import * as fs from 'fs';

/**
 * Language-based JSON file loader.
 * 
 * @author  Thiago Delgado Pinto
 */
export class LanguageBasedJsonFileLoader {

    /**
     * Constructs the loader.
     * 
     * @param _baseDir Base directory to load the files.
     * @param _dictMap Map with each language ( string => object | array ). Defaults to {}.
     * @param _encoding File encoding. Defaults to 'utf8'.
     */
    constructor(
        private _baseDir: string,
        private _dictMap: Object = {},
        private _encoding: string = 'utf8',
        private _fs = fs
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
        let fileExists: boolean = this._fs.existsSync( filePath );
        if ( ! fileExists ) {
            throw new Error( 'File not found: ' + filePath );
        }

        return this._dictMap[ language ] = JSON.parse( this.readFileContent( filePath ) );
    }

    private makeLanguageFilePath( language: string ): string {
        return join( this._baseDir, language + '.json' );
    }

    private readFileContent( filePath ): string {
        return this._fs.readFileSync( filePath, this._encoding );
    }

}