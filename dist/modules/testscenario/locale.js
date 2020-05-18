"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const localeMap = {
    'en': locale_1.enUS,
    'en-US': locale_1.enUS,
    'en-GB': locale_1.enGB,
    'pt': locale_1.ptBR,
    'pt-BR': locale_1.ptBR,
    'pt-PT': locale_1.pt
};
function formatLocale(locale) {
    const [lang, country] = locale.split('-');
    if (!country) {
        return lang.toLowerCase();
    }
    return lang.toLowerCase() + '-' + country.toUpperCase();
}
exports.formatLocale = formatLocale;
function isLocaleSupported(locale) {
    return !!localeMap[locale];
}
exports.isLocaleSupported = isLocaleSupported;
function fallbackToLanguage(locale) {
    const loc = formatLocale(locale);
    if (isLocaleSupported(loc)) {
        return loc;
    }
    const [lang] = loc.split('-');
    if (isLocaleSupported(lang)) {
        return lang;
    }
    return null;
}
exports.fallbackToLanguage = fallbackToLanguage;
function formatDateByLocale(locale, date) {
    // 'P' means long localized date
    return date_fns_1.format(date, 'P', { locale: localeMap[locale] });
}
exports.formatDateByLocale = formatDateByLocale;
function formatTimeByLocale(locale, time) {
    // 'HH:mm' uses 24 hour format
    return date_fns_1.format(time, 'HH:mm', { locale: localeMap[locale] });
}
exports.formatTimeByLocale = formatTimeByLocale;
function formatDateTimeByLocale(locale, dateTime) {
    const dateStr = formatDateByLocale(locale, dateTime);
    const timeStr = formatTimeByLocale(locale, dateTime);
    return dateStr + ' ' + timeStr;
}
exports.formatDateTimeByLocale = formatDateTimeByLocale;
