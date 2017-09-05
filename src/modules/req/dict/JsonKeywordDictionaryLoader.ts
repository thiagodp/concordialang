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
     */
    constructor( private _basePath: string = './' ) {
    }

    /**
     * @inheritDoc
     */
    load( language: string ): KeywordDictionary | null {
        let filePath = this.makeLanguageFilePath( language );
        let fileExists = 0 === ( new InputFileExtractor() ).nonExistentFiles( [ filePath ] ).length;
        if ( ! fileExists ) {
            return null;
        }
        return require( filePath ) as KeywordDictionary; // synchronous and cacheable
    }

    private makeLanguageFilePath( language: string ): string {
        return this._basePath + 'dict/' + language + '.json';
    }

}