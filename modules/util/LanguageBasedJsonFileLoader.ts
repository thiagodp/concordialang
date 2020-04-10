import { join } from 'path';
import { EnglishKeywordDictionary } from "../language/EnglishKeywordDictionary";
import { FileChecker } from '../util/file/FileChecker';
import { FileReader } from '../util/file/FileReader';

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
     * @param _map Map with each language ( string => object ). Defaults to {}.
     * @param _fileReader File reader to use
     * @param _fileChecker File checker to use
     */
    constructor(
        private _baseDir: string,
        private _map: Object = {},
        private _fileReader: FileReader,
        private _fileChecker: FileChecker,
    ) {
    }

    /**
     * Returns true whether the language file exists.
     *
     * @param language Language
     * @throws Error
     */
    public has( language: string ): boolean {
        if ( !! this._map[ language ] ) {
            return true;
        }
        return this._fileChecker.existsSync( this.makeLanguageFilePath( language ) );
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
        if ( !! this._map[ language ] ) {
            return this._map[ language ];
        }

        const filePath = this.makeLanguageFilePath( language );
        const fileExists: boolean = this._fileChecker.existsSync( filePath );
        if ( ! fileExists ) {
            throw new Error( 'File not found: ' + filePath );
        }
        const content = this._fileReader.readSync( filePath );
        this._map[ language ] = JSON.parse( content );

        // Add keywords for English
        if ( 'en' === language && ! this._map[ language ][ 'keywords' ] ) {
            this._map[ language ][ 'keywords' ] = new EnglishKeywordDictionary();
        }

        return this._map[ language ];
    }

    private makeLanguageFilePath( language: string ): string {
        return join( this._baseDir, language + '.json' );
    }

}