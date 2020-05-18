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
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
// Pre-loaded locales
const localeMap = {
    'en': locale_1.enUS,
    'en-US': locale_1.enUS,
    'pt': locale_1.ptBR,
    'pt-BR': locale_1.ptBR,
    'pt-PT': locale_1.pt
};
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
function isLocaleAvailable(locale) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isLocaleFormatValid(locale, true)) {
            return false;
        }
        if (localeMap[locale]) {
            return true;
        }
        let lib;
        try {
            lib = yield Promise.resolve().then(() => require(`date-fns/locale/${locale}`));
        }
        catch (err) {
            return false;
        }
        if (!localeMap[locale]) {
            localeMap[locale] = lib;
        }
        return true;
    });
}
exports.isLocaleAvailable = isLocaleAvailable;
function isLocaleLoaded(locale) {
    return !!localeMap[locale];
}
exports.isLocaleLoaded = isLocaleLoaded;
/**
 * Returns the formatted locale with language and country if available. If the
 * country is not available, returns the language. If the language is also not
 * available, returns `null`.
 *
 * @param locale Locale
 */
function fallbackToLanguage(locale) {
    return __awaiter(this, void 0, void 0, function* () {
        const loc = formatLocale(locale);
        if (isLocaleLoaded(loc)) {
            return loc;
        }
        const isAvailable = yield isLocaleAvailable(loc);
        if (isAvailable) {
            return loc;
        }
        const [lang] = loc.split('-');
        if (lang == loc) {
            return null;
        }
        return yield fallbackToLanguage(lang);
    });
}
exports.fallbackToLanguage = fallbackToLanguage;
/**
 * Returns a locale whether available or English otherwise.
 *
 * @param locale Locale to load
 */
function loadLocale(locale) {
    return __awaiter(this, void 0, void 0, function* () {
        const isAvailable = yield isLocaleAvailable(locale);
        return isAvailable ? localeMap[locale] : localeMap['en'];
    });
}
function formatDateByLocale(locale, date) {
    return __awaiter(this, void 0, void 0, function* () {
        const loc = yield loadLocale(locale);
        // 'P' means long localized date
        return date_fns_1.format(date, 'P', { locale: loc });
    });
}
exports.formatDateByLocale = formatDateByLocale;
function formatTimeByLocale(locale, time) {
    return __awaiter(this, void 0, void 0, function* () {
        const loc = yield loadLocale(locale);
        // 'HH:mm' uses 24 hour format
        return date_fns_1.format(time, 'HH:mm', { locale: loc });
    });
}
exports.formatTimeByLocale = formatTimeByLocale;
function formatDateTimeByLocale(locale, dateTime) {
    return __awaiter(this, void 0, void 0, function* () {
        const dateStr = yield formatDateByLocale(locale, dateTime);
        const timeStr = yield formatTimeByLocale(locale, dateTime);
        return dateStr + ' ' + timeStr;
    });
}
exports.formatDateTimeByLocale = formatDateTimeByLocale;
