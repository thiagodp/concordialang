import { format, Locale } from 'date-fns';
// import { enUS, pt, ptBR } from "date-fns/locale";
import * as allLocales from 'date-fns/locale/index.js';

const { enUS, pt, ptBR } = allLocales;

export type LocaleData = Locale;
export type LocaleMap = Map< string, LocaleData >;


// Pre-loaded locales
export function createDefaultLocaleMap(): LocaleMap {
    const map = new Map< string, LocaleData >();

    map.set( 'en', enUS );
    map.set( 'en-US', enUS );

    map.set( 'pt', ptBR );
    map.set( 'pt-BR', ptBR );
    map.set( 'pt-PT', pt );

    return map;
}


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

export async function isLocaleAvailable(
    locale: string,
    map: LocaleMap
): Promise< boolean > {

    if ( ! isLocaleFormatValid( locale, true ) ) {
        return false;
    }

    if ( map.has( locale ) ) {
        return true;
    }

    try {
        // let lib = await import( `date-fns/locale/${locale}/index.js` );
        // // Use default export
        // if ( lib.default ) {
        //     lib = lib.default;
        // }
		//
		// map.set( locale, lib );
        // return true;

		if ( allLocales[ locale ] ) {
			map.set( locale, allLocales[ locale ] );
			return true;
		}
		return false;
    } catch ( err ) {
        return false;
    }
}

/**
 * Returns the formatted locale with language and country if available. If the
 * country is not available, returns the language. If the language is also not
 * available, returns `null`.
 *
 * @param locale Locale
 * @param map Locale map
 */
export async function fallbackToLanguage(
    locale: string,
    map: LocaleMap
): Promise< string | null > {

    const loc = formatLocale( locale );

    if ( map.has( loc ) ) {
        return loc;
    }

    const isAvailable = await isLocaleAvailable( loc, map );
    if ( isAvailable ) {
        return loc;
    }

    const [ lang ] = loc.split( '-' );
    if ( lang == loc ) {
        return null;
    }

    return await fallbackToLanguage( lang, map );
}

/**
 * Returns a locale whether available or English otherwise.
 *
 * @param locale Locale to load
 * @param map Map to store the locale
 */
async function loadLocale(
    locale: string,
    map: LocaleMap
): Promise< LocaleData > {
    const isAvailable = await isLocaleAvailable( locale, map );
    return isAvailable ? map.get( locale ) : map.get( 'en' );
}

export async function formatDateByLocale(
    locale: string,
    map: LocaleMap,
    date: Date
): Promise< string > {
    const loc = await loadLocale( locale, map );
    // 'P' means long localized date
    return format( date, 'P', { locale: loc } );
}

export async function formatTimeByLocale(
    locale: string,
    map: LocaleMap,
    time: Date,
    includeSeconds: boolean
): Promise< string > {
    const loc = await loadLocale( locale, map );
    // HH is 24 hour format
    if ( includeSeconds ) {
        // 'HH:mm:ss'
        return format( time, 'HH:mm:ss', { locale: loc } );
    }
    // 'HH:mm'
    return format( time, 'HH:mm', { locale: loc } );
}

export async function formatDateTimeByLocale(
    locale: string,
    map: LocaleMap,
    dateTime: Date,
    includeSeconds: boolean
): Promise< string > {
    const dateStr = await formatDateByLocale( locale, map, dateTime );
    const timeStr = await formatTimeByLocale( locale, map, dateTime, includeSeconds );
    return dateStr + ' ' + timeStr;
}

export async function formatUsingLocale(
    locale: string,
    map: LocaleMap,
    nativeDate: Date,
    localeFormat: string,
): Promise< string > {
    const loc = await loadLocale( locale, map );
    return format( nativeDate, localeFormat, { locale: loc } );
}
