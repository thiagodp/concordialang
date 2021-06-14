import { format } from 'date-fns';
import { enUS, pt, ptBR } from "date-fns/locale";
// Pre-loaded locales
export function createDefaultLocaleMap() {
    const map = new Map();
    map.set('en', enUS);
    map.set('en-US', enUS);
    map.set('pt', ptBR);
    map.set('pt-BR', ptBR);
    map.set('pt-PT', pt);
    return map;
}
export function isLocaleFormatValid(locale, strict = false) {
    if (strict) {
        return /^[a-z]{2}(?:\-[A-Z]{2})?$/.test(locale);
    }
    return /^[A-Za-z]{2}(?:\-[A-Za-z]{2})?$/.test(locale);
}
export function formatLocale(locale) {
    const [lang, country] = locale.split('-');
    if (!country) {
        return lang.toLowerCase();
    }
    return lang.toLowerCase() + '-' + country.toUpperCase();
}
export async function isLocaleAvailable(locale, map) {
    if (!isLocaleFormatValid(locale, true)) {
        return false;
    }
    if (map.has(locale)) {
        return true;
    }
    try {
        let lib = await import(`date-fns/locale/${locale}`);
        // Use default export
        if (lib.default) {
            lib = lib.default;
        }
        map.set(locale, lib);
        return true;
    }
    catch (err) {
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
export async function fallbackToLanguage(locale, map) {
    const loc = formatLocale(locale);
    if (map.has(loc)) {
        return loc;
    }
    const isAvailable = await isLocaleAvailable(loc, map);
    if (isAvailable) {
        return loc;
    }
    const [lang] = loc.split('-');
    if (lang == loc) {
        return null;
    }
    return await fallbackToLanguage(lang, map);
}
/**
 * Returns a locale whether available or English otherwise.
 *
 * @param locale Locale to load
 * @param map Map to store the locale
 */
async function loadLocale(locale, map) {
    const isAvailable = await isLocaleAvailable(locale, map);
    return isAvailable ? map.get(locale) : map.get('en');
}
export async function formatDateByLocale(locale, map, date) {
    const loc = await loadLocale(locale, map);
    // 'P' means long localized date
    return format(date, 'P', { locale: loc });
}
export async function formatTimeByLocale(locale, map, time, includeSeconds) {
    const loc = await loadLocale(locale, map);
    // HH is 24 hour format
    if (includeSeconds) {
        // 'HH:mm:ss'
        return format(time, 'HH:mm:ss', { locale: loc });
    }
    // 'HH:mm'
    return format(time, 'HH:mm', { locale: loc });
}
export async function formatDateTimeByLocale(locale, map, dateTime, includeSeconds) {
    const dateStr = await formatDateByLocale(locale, map, dateTime);
    const timeStr = await formatTimeByLocale(locale, map, dateTime, includeSeconds);
    return dateStr + ' ' + timeStr;
}
export async function formatUsingLocale(locale, map, nativeDate, localeFormat) {
    const loc = await loadLocale(locale, map);
    return format(nativeDate, localeFormat, { locale: loc });
}
