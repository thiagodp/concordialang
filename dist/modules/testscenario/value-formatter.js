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
const ValueTypeDetector_1 = require("../util/ValueTypeDetector");
const locale_1 = require("./locale");
/**
 * Returns the formatted value to use in a sentence.
 *
 * @param valueType Value type to consider.
 * @param localeContext Locale context
 * @param value Value to format
 * @param isAlreadyInsideAString Indicates if the value is already inside a string. Optional, defaults to `false`.
 */
function formatValueToUseInASentence(valueType, localeContext, value, isAlreadyInsideAString = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const loc = yield localeContext.resolve();
        const isLocaleFormatDefined = !!localeContext.localeFormat;
        let formattedValue = value;
        // TODO: l10n for currency values
        if (value instanceof core_1.LocalTime) {
            // formattedValue = value.format( DateTimeFormatter.ofPattern( 'HH:mm' ) ).toString();
            const nativeTime = new Date();
            nativeTime.setHours(value.hour(), value.minute(), value.second());
            if (isLocaleFormatDefined) {
                formattedValue = yield locale_1.formatUsingLocale(loc, localeContext.localeMap, nativeTime, localeContext.localeFormat);
            }
            else {
                const includeSeconds = valueType === ValueTypeDetector_1.ValueType.LONG_TIME;
                formattedValue = yield locale_1.formatTimeByLocale(loc, localeContext.localeMap, nativeTime, includeSeconds);
            }
        }
        else if (value instanceof core_1.LocalDate) {
            // formattedValue = value.format( DateTimeFormatter.ofPattern( 'dd/MM/yyyy' ) ).toString();
            const nativeDate = new Date(value.year(), value.monthValue() - 1, value.dayOfMonth());
            if (isLocaleFormatDefined) {
                formattedValue = yield locale_1.formatUsingLocale(loc, localeContext.localeMap, nativeDate, localeContext.localeFormat);
            }
            else {
                formattedValue = yield locale_1.formatDateByLocale(loc, localeContext.localeMap, nativeDate);
            }
        }
        else if (value instanceof core_1.LocalDateTime) {
            // formattedValue = value.format( DateTimeFormatter.ofPattern( 'dd/MM/yyyy HH:mm' ) ).toString();
            const includeSeconds = valueType === ValueTypeDetector_1.ValueType.LONG_DATE_TIME;
            const nativeDateTime = new Date(value.year(), value.monthValue() - 1, value.dayOfMonth(), value.hour(), value.minute(), value.second());
            if (isLocaleFormatDefined) {
                formattedValue = yield locale_1.formatUsingLocale(loc, localeContext.localeMap, nativeDateTime, localeContext.localeFormat);
            }
            else {
                formattedValue = yield locale_1.formatDateTimeByLocale(loc, localeContext.localeMap, nativeDateTime, includeSeconds);
            }
        }
        if (isAlreadyInsideAString || 'number' === typeof formattedValue) {
            return formattedValue.toString();
        }
        return Symbols_1.Symbols.VALUE_WRAPPER + formattedValue.toString() + Symbols_1.Symbols.VALUE_WRAPPER;
    });
}
exports.formatValueToUseInASentence = formatValueToUseInASentence;
