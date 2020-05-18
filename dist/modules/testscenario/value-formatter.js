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
const core_1 = require("@js-joda/core");
const Symbols_1 = require("../req/Symbols");
const locale_1 = require("./locale");
/**
 * Returns the formatted value to use in a sentence.
 *
 * @param locale Locale, such as en-US, pt-BR, etc.
 * @param value Value to format
 * @param isAlreadyInsideAString Indicates if the value is already inside a string. Optional, defaults to `false`.
 */
function formatValueToUseInASentence(locale, value, isAlreadyInsideAString = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const loc = (yield locale_1.fallbackToLanguage(locale)) || 'en';
        let formattedValue = value;
        // TODO: l10n for currency values
        if (value instanceof core_1.LocalTime) {
            // formattedValue = value.format( DateTimeFormatter.ofPattern( 'HH:mm' ) ).toString();
            const nativeTime = new Date();
            nativeTime.setHours(value.hour(), value.minute(), value.second());
            formattedValue = yield locale_1.formatTimeByLocale(loc, nativeTime);
        }
        else if (value instanceof core_1.LocalDate) {
            // formattedValue = value.format( DateTimeFormatter.ofPattern( 'dd/MM/yyyy' ) ).toString();
            const nativeDate = new Date(value.year(), value.monthValue() - 1, value.dayOfMonth());
            formattedValue = yield locale_1.formatDateByLocale(loc, nativeDate);
        }
        else if (value instanceof core_1.LocalDateTime) {
            // formattedValue = value.format( DateTimeFormatter.ofPattern( 'dd/MM/yyyy HH:mm' ) ).toString();
            const nativeDateTime = new Date(value.year(), value.monthValue() - 1, value.dayOfMonth(), value.hour(), value.minute(), value.second());
            formattedValue = yield locale_1.formatDateTimeByLocale(loc, nativeDateTime);
        }
        if (isAlreadyInsideAString || 'number' === typeof formattedValue) {
            return formattedValue.toString();
        }
        return Symbols_1.Symbols.VALUE_WRAPPER + formattedValue.toString() + Symbols_1.Symbols.VALUE_WRAPPER;
    });
}
exports.formatValueToUseInASentence = formatValueToUseInASentence;
