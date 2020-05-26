import { LocalDate, LocalDateTime, LocalTime } from "@js-joda/core";
import { Symbols } from "../req/Symbols";
import { ValueType } from "../util/ValueTypeDetector";
import { formatDateByLocale, formatDateTimeByLocale, formatTimeByLocale } from "./locale";
import { LocaleContext } from "./LocaleContext";

/**
 * Returns the formatted value to use in a sentence.
 *
 * @param localeContext Locale context
 * @param value Value to format
 * @param isAlreadyInsideAString Indicates if the value is already inside a string. Optional, defaults to `false`.
 */
export async function formatValueToUseInASentence(
    valueType: ValueType,
    localeContext: LocaleContext,
    value: any,
    isAlreadyInsideAString: boolean = false
): Promise< string > {

    const loc: string = await localeContext.resolve();
    let formattedValue = value;

    // TODO: l10n for currency values

    if ( value instanceof LocalTime ) {
        // formattedValue = value.format( DateTimeFormatter.ofPattern( 'HH:mm' ) ).toString();
        const includeSeconds = valueType === ValueType.LONG_TIME;
        const nativeTime = new Date();
        nativeTime.setHours( value.hour(), value.minute(), value.second() );
        formattedValue = await formatTimeByLocale(
            loc, localeContext.localeMap, nativeTime, includeSeconds );

    } else if ( value instanceof LocalDate ) {
        // formattedValue = value.format( DateTimeFormatter.ofPattern( 'dd/MM/yyyy' ) ).toString();
        const nativeDate = new Date( value.year(), value.monthValue() - 1, value.dayOfMonth() );
        formattedValue = await formatDateByLocale( loc, localeContext.localeMap, nativeDate );

    } else if ( value instanceof LocalDateTime ) {
        // formattedValue = value.format( DateTimeFormatter.ofPattern( 'dd/MM/yyyy HH:mm' ) ).toString();
        const includeSeconds = valueType === ValueType.LONG_DATE_TIME;
        const nativeDateTime = new Date(
            value.year(), value.monthValue() - 1, value.dayOfMonth(),
            value.hour(), value.minute(), value.second()
            );
        formattedValue = await formatDateTimeByLocale(
            loc, localeContext.localeMap, nativeDateTime, includeSeconds );
    }

    if ( isAlreadyInsideAString || 'number' === typeof formattedValue ) {
        return formattedValue.toString();
    }

    return Symbols.VALUE_WRAPPER + formattedValue.toString() + Symbols.VALUE_WRAPPER;
}