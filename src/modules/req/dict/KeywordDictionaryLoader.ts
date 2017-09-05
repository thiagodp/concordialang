import { InputFileExtractor } from '../../util/InputFileExtractor';
import { KeywordDictionary } from './KeywordDictionary';

/**
 * Keyword dictionary loader.
 * 
 * @author  Thiago Delgado Pinto
 */
export interface KeywordDictionaryLoader {

    /**
     * Loads a keyword dictionary for the given language. Returns null if
     * a dictionary were not found.
     * 
     * @param language Language
     */
    load( language: string ): KeywordDictionary | null;

}
