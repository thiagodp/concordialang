import { format, Locale } from 'date-fns'
import { enUS, pt, ptBR } from "date-fns/locale";

// Pre-loaded locales
const localeMap = {
    'en': enUS,
    'en-US': enUS,

    'pt': ptBR,
    'pt-BR': ptBR,
    'pt-PT': pt
};

export function isLocaleFormatValid( locale: string, strict: boolean = false ): boolean {
    if ( strict ) {
        return /^[a-z]{2}(?:\-[A-Z]{2})?$/.test( locale );
    }
    return /^[A-Za-z]{2}(?:\-[A-Za-z]{2})?$/.test( locale );
}

export function formatLocale( locale: string ): string {
    const [ lang, country ] = locale.split( '-' );
    if ( ! country ) {
        return lang.toLowerCase();
    }
    return lang.toLowerCase() + '-' + country.toUpperCase();
}

export async function isLocaleAvailable( locale: string ): Promise< boolean > {
    if ( ! isLocaleFormatValid( locale, true ) ) {
        return false;
    }
    if ( localeMap[ locale ] ) {
        return true;
    }
    let lib;
    try {
        lib = await import( `date-fns/locale/${locale}` );
    } catch ( err ) {
        return false;
    }
    if ( ! localeMap[ locale ] ) {
        localeMap[ locale ] = lib;
    }
    return true;
}

export function isLocaleLoaded( locale: string ): boolean {
    return !! localeMap[ locale ];
}

/**
 * Returns the formatted locale with language and country if available. If the
 * country is not available, returns the language. If the language is also not
 * available, returns `null`.
 *
 * @param locale Locale
 */
export async function fallbackToLanguage( locale: string ): Promise< string | null > {
    const loc = formatLocale( locale );
    if ( isLocaleLoaded( loc ) ) {
        return loc;
    }
    const isAvailable = await isLocaleAvailable( loc );
    if ( isAvailable ) {
        return loc;
    }

    const [ lang ] = loc.split( '-' );
    if ( lang == loc ) {
        return null;
    }
    return await fallbackToLanguage( lang );
}

/**
 * Returns a locale whether available or English otherwise.
 *
 * @param locale Locale to load
 */
async function loadLocale( locale: string ): Promise< Locale > {
    const isAvailable = await isLocaleAvailable( locale );
    return isAvailable ? localeMap[ locale ] : localeMap[ 'en' ];
}

export async function formatDateByLocale( locale: string, date: Date ): Promise< string > {
    const loc = await loadLocale( locale );
    // 'P' means long localized date
    return format( date, 'P', { locale: loc } );
}

export async function formatTimeByLocale( locale: string, time: Date ): Promise< string > {
    const loc = await loadLocale( locale );
    // 'HH:mm' uses 24 hour format
    return format( time, 'HH:mm', { locale: loc } );
}

export async function formatDateTimeByLocale( locale: string, dateTime: Date ): Promise< string > {
    const dateStr = await formatDateByLocale( locale, dateTime );
    const timeStr = await formatTimeByLocale( locale, dateTime );
    return dateStr + ' ' + timeStr;
}
