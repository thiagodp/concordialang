import { LanguageDictionary } from '../LanguageDictionary';
import en from './en';
import pt from './pt';

export type LanguageMap = Record< string, LanguageDictionary >;

export const availableLanguages = [ 'en', 'pt' ];

const map: LanguageMap = {
    'en': en,
    'pt': pt,
};

export function dictionaryForLanguage( language: string ): LanguageDictionary {
    return map[ language ] || en;
}

export default map;


