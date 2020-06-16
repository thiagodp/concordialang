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
exports.LocaleContext = void 0;
const locale_1 = require("./locale");
class LocaleContext {
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
    resolve() {
        return __awaiter(this, void 0, void 0, function* () {
            let loc;
            if (this.locale) {
                loc = yield locale_1.fallbackToLanguage(this.locale, this.localeMap);
            }
            if (!loc && this.language) {
                loc = yield locale_1.fallbackToLanguage(this.language, this.localeMap);
            }
            return loc || 'en';
        });
    }
}
exports.LocaleContext = LocaleContext;
