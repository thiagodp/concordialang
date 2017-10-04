import { InputFileExtractor } from '../util/InputFileExtractor';
import { KeywordDictionary } from './KeywordDictionary';

/**
 * Keyword dictionary loader.
 * 
 * @author  Thiago Delgado Pinto
 */
export interface KeywordDictionaryLoader {

    /**
     * Loads a keyword dictionary for the given language.
     * 
     * @param language Language of the dictionary.
     * @returns A dictionary.
     * 
     * @throws Error If a dictionary with the given language is not found.
     */
    load( language: string ): KeywordDictionary;

}
