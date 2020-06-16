import { LocaleMap, fallbackToLanguage } from "./locale";

export class LocaleContext {

    /**
     * @param language      Document's language, such as "en" or "pt".
     * @param locale        Locale to use, such as "en-US" or "pt-BR".
     * @param localeMap     Storage for locale data.
     * @param localeFormat  Locale format for the current UI Element. Optional.
     *                      The default is `undefined`.
     */
    constructor(
        public language: string,
        public locale: string,
        public localeMap: LocaleMap,
        public localeFormat?: string | null | undefined
    ) {
    }

    /**
     * Clones the current object.
     */
    clone(): LocaleContext {
        return new LocaleContext(
            this.language,
            this.locale,
            this.localeMap,
            this.localeFormat
        );
    }

    withLocale( locale: string ): LocaleContext {
        this.locale = locale;
        return this;
    }

    withLocaleFormat( localeFormat: string | null ): LocaleContext {
        this.localeFormat = localeFormat;
        return this;
    }

    /**
     * Returns an available locale according to the context.
     */
    public async resolve(): Promise< string > {
        let loc: string;

        if ( this.locale ) {
            loc = await fallbackToLanguage( this.locale, this.localeMap );
        }

        if ( ! loc && this.language ) {
            loc = await fallbackToLanguage( this.language, this.localeMap );
        }

        return loc || 'en';
    }

}