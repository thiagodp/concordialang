import { fallbackToLanguage } from "./locale";
export class LocaleContext {
    /**
     * @param language      Document's language, such as "en" or "pt".
     * @param locale        Locale to use, such as "en-US" or "pt-BR".
     * @param localeMap     Storage for locale data.
     * @param localeFormat  Locale format for the current UI Element. Optional.
     *                      The default is `undefined`.
     */
    constructor(language, locale, localeMap, localeFormat) {
        this.language = language;
        this.locale = locale;
        this.localeMap = localeMap;
        this.localeFormat = localeFormat;
    }
    /**
     * Clones the current object.
     */
    clone() {
        return new LocaleContext(this.language, this.locale, this.localeMap, this.localeFormat);
    }
    withLocale(locale) {
        this.locale = locale;
        return this;
    }
    withLocaleFormat(localeFormat) {
        this.localeFormat = localeFormat;
        return this;
    }
    /**
     * Returns an available locale according to the context.
     */
    async resolve() {
        let loc;
        if (this.locale) {
            loc = await fallbackToLanguage(this.locale, this.localeMap);
        }
        if (!loc && this.language) {
            loc = await fallbackToLanguage(this.language, this.localeMap);
        }
        return loc || 'en';
    }
}
