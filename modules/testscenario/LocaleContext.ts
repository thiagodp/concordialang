import { LocaleMap, fallbackToLanguage } from "./locale";

export class LocaleContext {

    /**
     * @param language Document's language, such as "en" or "pt".
     * @param locale Locale to use, such as "en-US" or "pt-BR".
     * @param localeMap Storage for locale data.
     */
    constructor(
        public language: string,
        public locale: string,
        public localeMap: LocaleMap
    ) {
    }

    /**
     * Clones the current object.
     */
    clone(): LocaleContext {
        return new LocaleContext(
            this.language,
            this.locale,
            this.localeMap
        );
    }

    withLocale( locale: string ): LocaleContext {
        this.locale = locale;
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