import { Defaults } from './Defaults';
import * as filewalker from 'filewalker';
import * as path from 'path';

/**
 * Language manager
 * 
 * @author Thiago Delgado Pinto
 */
export class LanguageManager {

    private _cache: string[] = [];

    /**
     * Constructor
     * 
     * @param _dir Directory to search language files.
     */
    constructor(
        private _dir?: string
    ) {
        if ( ! this._dir ) {
            this._dir = path.join( process.cwd(), ( new Defaults() ).LANGUAGE_DIR );
        }
    }

    /**
     * Returns available languages.
     * 
     * @param useCache Uses cached results whether available. Defaults to false.
     */
    public availableLanguages = async ( useCache: boolean = false ): Promise< string[] > => {

        if ( useCache && this._cache.length > 0 ) {
            return this._cache;
        }

        // Gets languages from files
        let files: string[] = await this.languageFiles();
        let languages: string[] = files.map( f => f.substring( f.lastIndexOf( path.sep ), f.lastIndexOf( '.' ) ) );

        // Adds the default language
        languages.push( ( new Defaults() ).LANGUAGE );

        // Add to cache
        this._cache = languages;

        return languages;
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
                matchRegExp: new RegExp( '\\.json$' )
            };

            let files: string[] = [];

            filewalker( this._dir, options )
                .on( 'file', ( p: string, s ) => files.push( p ) )
                .on( 'error', ( err ) => reject( err ) )
                .on( 'done', () => resolve( files ) )
                .walk()
                ;
        } );

    };

    /**
     * Returns the directory used to search files.
     */
    public dir = (): string => {
        return this._dir;
    };

}