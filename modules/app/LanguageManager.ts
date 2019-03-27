import * as fwalker from 'fwalker';
import * as path from 'path';
import { EnglishKeywordDictionary } from '../dict/EnglishKeywordDictionary';

/**
 * Language manager
 *
 * @author Thiago Delgado Pinto
 */
export class LanguageManager {

    private readonly ENGLISH_LANGUAGE: string = 'en';

    /**
     * Constructor
     *
     * @param _languageDir Directory to search language files.
     */
    constructor(
        private _languageDir: string,
        private _languageCache: Map< string, object > = new Map< string, object >()
    ) {
    }

    /**
     * Returns available languages.
     *
     * @param ignoreCache Whether it should ignore cached content. Defaults to false.
     */
    public availableLanguages = async ( ignoreCache: boolean = false ): Promise< string[] > => {

        if ( ! ignoreCache && this._languageCache.size > 0 ) {
            return [ ... this._languageCache.keys() ];
        }

        this._languageCache.clear();

        // Adds the english language
        this._languageCache.set( this.ENGLISH_LANGUAGE, new EnglishKeywordDictionary() );

        // Add file names, without content
        const files: string[] = await this.languageFiles();
        for ( let file of files ) {
            const language: string = file.substring( file.lastIndexOf( path.sep ), file.lastIndexOf( '.' ) );
            this._languageCache.set( language, null ); // No content yet - will be loaded on demand
        }

        return [ ... this._languageCache.keys() ];
    };

    /**
     * Returns available language files.
     */
    public languageFiles = async (): Promise< string[] > => {

        return new Promise< string[] >( ( resolve, reject ) => {

            const options = {
                maxPending: -1,
                maxAttempts: 0,
                attemptTimeout: 1000,
                matchRegExp: new RegExp( '\\.json$' ),
                recursive: false
            };

            let files: string[] = [];

            fwalker( this._languageDir, options )
                .on( 'file', ( relPath, stats, absPath ) => files.push( relPath ) )
                .on( 'error', ( err ) => reject( err ) )
                .on( 'done', () => resolve( files ) )
                .walk()
                ;
        } );

    };

    /**
     * Returns a content of a language.
     *
     * @param language Language to load.
     * @return Promise to the content, null or undefined.
     */
    /*
    public contentOf = async ( language: string, ignoreCache: boolean = false ): Promise< object | null | undefined > => {
        if ( ignoreCache ) {
            await this.availableLanguages( true );
        }
        if ( ! this._languageCache.has( language ) ) {
            return null;
        }
        let content = this._languageCache.get( language );
        if ( ! content ) {
            content = fse.readJson( this.makeLanguageFilePath( language ) );
            this._languageCache.set( language, content );
        }
        return content;
    };
    */

    /**
     * Returns the directory used to search files.
     */
    public dir = (): string => {
        return this._languageDir;
    };

    // private makeLanguageFilePath( language: string ): string {
    //     return path.join( this._languageDir,  language + '.json' );
    // }

}