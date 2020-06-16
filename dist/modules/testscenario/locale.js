"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatUsingLocale = exports.formatDateTimeByLocale = exports.formatTimeByLocale = exports.formatDateByLocale = exports.fallbackToLanguage = exports.isLocaleAvailable = exports.formatLocale = exports.isLocaleFormatValid = exports.createDefaultLocaleMap = void 0;
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
// Pre-loaded locales
function createDefaultLocaleMap() {
    const map = new Map();
    map.set('en', locale_1.enUS);
    map.set('en-US', locale_1.enUS);
    map.set('pt', locale_1.ptBR);
    map.set('pt-BR', locale_1.ptBR);
    map.set('pt-PT', locale_1.pt);
    return map;
}
exports.createDefaultLocaleMap = createDefaultLocaleMap;
function isLocaleFormatValid(locale, strict = false) {
    if (strict) {
        return /^[a-z]{2}(?:\-[A-Z]{2})?$/.test(locale);
    }
    return /^[A-Za-z]{2}(?:\-[A-Za-z]{2})?$/.test(locale);
}
exports.isLocaleFormatValid = isLocaleFormatValid;
function formatLocale(locale) {
    const [lang, country] = locale.split('-');
    if (!country) {
        return lang.toLowerCase();
    }
    return lang.toLowerCase() + '-' + country.toUpperCase();
}
exports.formatLocale = formatLocale;
function isLocaleAvailable(locale, map) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isLocaleFormatValid(locale, true)) {
            return false;
        }
        if (map.has(locale)) {
            return true;
        }
        try {
            let lib = yield Promise.resolve().then(() => require(`date-fns/locale/${locale}`));
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
    });
}
exports.isLocaleAvailable = isLocaleAvailable;
/**
 * Returns the formatted locale with language and country if available. If the
 * country is not available, returns the language. If the language is also not
 * available, returns `null`.
 *
 * @param locale Locale
 * @param map Locale map
 */
function fallbackToLanguage(locale, map) {
    return __awaiter(this, void 0, void 0, function* () {
        const loc = formatLocale(locale);
        if (map.has(loc)) {
            return loc;
        }
        const isAvailable = yield isLocaleAvailable(loc, map);
        if (isAvailable) {
            return loc;
        }
        const [lang] = loc.split('-');
        if (lang == loc) {
            return null;
        }
        return yield fallbackToLanguage(lang, map);
    });
}
exports.fallbackToLanguage = fallbackToLanguage;
/**
 * Returns a locale whether available or English otherwise.
 *
 * @param locale Locale to load
 * @param map Map to store the locale
 */
function loadLocale(locale, map) {
    return __awaiter(this, void 0, void 0, function* () {
        const isAvailable = yield isLocaleAvailable(locale, map);
        return isAvailable ? map.get(locale) : map.get('en');
    });
}
function formatDateByLocale(locale, map, date) {
    return __awaiter(this, void 0, void 0, function* () {
        const loc = yield loadLocale(locale, map);
        // 'P' means long localized date
        return date_fns_1.format(date, 'P', { locale: loc });
    });
}
exports.formatDateByLocale = formatDateByLocale;
function formatTimeByLocale(locale, map, time, includeSeconds) {
    return __awaiter(this, void 0, void 0, function* () {
        const loc = yield loadLocale(locale, map);
        // HH is 24 hour format
        if (includeSeconds) {
            // 'HH:mm:ss'
            return date_fns_1.format(time, 'HH:mm:ss', { locale: loc });
        }
        // 'HH:mm'
        return date_fns_1.format(time, 'HH:mm', { locale: loc });
    });
}
exports.formatTimeByLocale = formatTimeByLocale;
function formatDateTimeByLocale(locale, map, dateTime, includeSeconds) {
    return __awaiter(this, void 0, void 0, function* () {
        const dateStr = yield formatDateByLocale(locale, map, dateTime);
        const timeStr = yield formatTimeByLocale(locale, map, dateTime, includeSeconds);
        return dateStr + ' ' + timeStr;
    });
}
exports.formatDateTimeByLocale = formatDateTimeByLocale;
function formatUsingLocale(locale, map, nativeDate, localeFormat) {
    return __awaiter(this, void 0, void 0, function* () {
        const loc = yield loadLocale(locale, map);
        return date_fns_1.format(nativeDate, localeFormat, { locale: loc });
    });
}
exports.formatUsingLocale = formatUsingLocale;
