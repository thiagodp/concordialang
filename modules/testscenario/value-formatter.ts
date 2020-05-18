import { LocalDate, LocalDateTime, LocalTime, DateTimeFormatter } from "@js-joda/core";
import { Symbols } from "../req/Symbols";
import { fallbackToLanguage, formatDateByLocale, formatDateTimeByLocale, formatTimeByLocale } from "./locale";

/**
 * Returns the formatted value to use in a sentence.
 *
 * @param locale Locale, such as en-US, pt-BR, etc.
 * @param value Value to format
 * @param isAlreadyInsideAString Indicates if the value is already inside a string. Optional, defaults to `false`.
 */
export async function formatValueToUseInASentence(
    locale: string,
    value: any,
    isAlreadyInsideAString: boolean = false
): Promise< string > {

    const loc = await fallbackToLanguage( locale ) || 'en';
    let formattedValue = value;

    // TODO: l10n for currency values

    if ( value instanceof LocalTime ) {
        // formattedValue = value.format( DateTimeFormatter.ofPattern( 'HH:mm' ) ).toString();
        const nativeTime = new Date();
        nativeTime.setHours( value.hour(), value.minute(), value.second() );
        formattedValue = await formatTimeByLocale( loc, nativeTime );
    } else if ( value instanceof LocalDate ) {
        // formattedValue = value.format( DateTimeFormatter.ofPattern( 'dd/MM/yyyy' ) ).toString();
        const nativeDate = new Date( value.year(), value.monthValue() - 1, value.dayOfMonth() );
        formattedValue = await formatDateByLocale( loc, nativeDate );
    } else if ( value instanceof LocalDateTime ) {
        // formattedValue = value.format( DateTimeFormatter.ofPattern( 'dd/MM/yyyy HH:mm' ) ).toString();
        const nativeDateTime = new Date(
            value.year(), value.monthValue() - 1, value.dayOfMonth(),
            value.hour(), value.minute(), value.second()
            );
        formattedValue = await formatDateTimeByLocale( loc, nativeDateTime );
    }

    if ( isAlreadyInsideAString || 'number' === typeof formattedValue ) {
        return formattedValue.toString();
    }

    return Symbols.VALUE_WRAPPER + formattedValue.toString() + Symbols.VALUE_WRAPPER;
}