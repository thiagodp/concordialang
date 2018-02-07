import { KeywordDictionaryLoader } from "./KeywordDictionaryLoader";
import { KeywordDictionary } from './KeywordDictionary';
import { LanguageBasedJsonFileLoader } from "../util/LanguageBasedJsonFileLoader";

/**
 * JSON keyword dictionary loader.
 * 
 * @author  Thiago Delgado Pinto
 */
export class JsonKeywordDictionaryLoader
    extends LanguageBasedJsonFileLoader
    implements KeywordDictionaryLoader {

    /** @inheritDoc */
    public load( language: string ): KeywordDictionary {
        return super.load( language ) as KeywordDictionary;
    }

}