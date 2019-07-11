"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_joda_1 = require("js-joda");
const Symbols_1 = require("../req/Symbols");
/**
 * Returns the formatted value to use in a sentence.
 *
 * TO-DO: l10n
 *
 * @param value Value to format
 */
function formatValueToUseInASentence(value) {
    let formattedValue = value;
    // TODO: l10n / i18n
    if (value instanceof js_joda_1.LocalTime) {
        formattedValue = value.format(js_joda_1.DateTimeFormatter.ofPattern('HH:mm')).toString();
    }
    else if (value instanceof js_joda_1.LocalDate) {
        formattedValue = value.format(js_joda_1.DateTimeFormatter.ofPattern('dd/MM/yyyy')).toString();
    }
    else if (value instanceof js_joda_1.LocalDateTime) {
        formattedValue = value.format(js_joda_1.DateTimeFormatter.ofPattern('dd/MM/yyyy HH:mm')).toString();
    }
    return 'number' === typeof formattedValue
        ? formattedValue
        : Symbols_1.Symbols.VALUE_WRAPPER + formattedValue + Symbols_1.Symbols.VALUE_WRAPPER;
}
exports.formatValueToUseInASentence = formatValueToUseInASentence;
