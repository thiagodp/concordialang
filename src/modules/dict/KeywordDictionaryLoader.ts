import { InputFileExtractor } from '../util/InputFileExtractor';
import { KeywordDictionary } from './KeywordDictionary';

/**
 * Keyword dictionary loader.
 * 
 * @author  Thiago Delgado Pinto
 */
export interface KeywordDictionaryLoader {

    /**
     * Loads a keyword dictionary for the given language. Throws an exception if
     * a dictionary were not found.
     * 
     * @param language Language
     * @throws Error
     */
    load( language: string ): KeywordDictionary;

}
