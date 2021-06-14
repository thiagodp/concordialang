import en from './en';
import pt from './pt';
export const availableLanguages = ['en', 'pt'];
const map = {
    'en': en,
    'pt': pt,
};
export function dictionaryForLanguage(language) {
    return map[language] || en;
}
export default map;
