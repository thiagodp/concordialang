"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatValueToUseInASentence = void 0;
const core_1 = require("@js-joda/core");
const Symbols_1 = require("../req/Symbols");
/**
 * Returns the formatted value to use in a sentence.
 *
 * TO-DO: l10n
 *
 * @param value Value to format
 * @param insideStringValue Indicates if the value is already inside a string. Optional, defaults to `false`.
 */
function formatValueToUseInASentence(value, insideStringValue = false) {
    let formattedValue = value;
    // TODO: l10n / i18n
    if (value instanceof core_1.LocalTime) {
        formattedValue = value.format(core_1.DateTimeFormatter.ofPattern('HH:mm')).toString();
    }
    else if (value instanceof core_1.LocalDate) {
        formattedValue = value.format(core_1.DateTimeFormatter.ofPattern('dd/MM/yyyy')).toString();
    }
    else if (value instanceof core_1.LocalDateTime) {
        formattedValue = value.format(core_1.DateTimeFormatter.ofPattern('dd/MM/yyyy HH:mm')).toString();
    }
    return insideStringValue || 'number' === typeof formattedValue
        ? formattedValue
        : Symbols_1.Symbols.VALUE_WRAPPER + formattedValue + Symbols_1.Symbols.VALUE_WRAPPER;
}
exports.formatValueToUseInASentence = formatValueToUseInASentence;
