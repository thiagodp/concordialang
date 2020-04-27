import { parse } from 'path';
import { FileSearcher } from '../util/file';
import { EnglishKeywordDictionary } from './EnglishKeywordDictionary';


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
        private readonly _fileSearcher: FileSearcher,
        private readonly _languageDir: string,
        private readonly _languageCache: Map< string, object > = new Map< string, object >()
    ) {
    }

    /**
     * Returns available languages.
     *
     * @param ignoreCache Whether it should ignore cached content. Defaults to false.
     */
    public async availableLanguages( ignoreCache: boolean = false ): Promise< string[] > {

        if ( ! ignoreCache && this._languageCache.size > 0 ) {
            return [ ... this._languageCache.keys() ];
        }

        this._languageCache.clear();

        // Adds the english language
        this._languageCache.set( this.ENGLISH_LANGUAGE, new EnglishKeywordDictionary() );

        // Add file names, without content
        const files: string[] = await this.languageFiles();
        for ( let file of files ) {
            const language: string = parse( file ).name;
            this._languageCache.set( language, null ); // No content yet - will be loaded on demand
        }

        return [ ... this._languageCache.keys() ];
    }

    /**
     * Returns available language files.
     */
    public async languageFiles(): Promise< string[] > {

        return await this._fileSearcher.searchFrom( {
            directory: this._languageDir,
            recursive: true,
            extensions: [ '.json' ],
            file: [],
            ignore: []
        } );
    }

    /**
     * Returns the directory used to search files.
     */
    public dir(): string {
        return this._languageDir;
    }

}