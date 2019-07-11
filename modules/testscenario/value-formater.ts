import { DateTimeFormatter, LocalTime, LocalDate, LocalDateTime } from "js-joda";

import { Symbols } from "../req/Symbols";

/**
 * Returns the formatted value to use in a sentence.
 *
 * TO-DO: l10n
 *
 * @param value Value to format
 */
export function formatValueToUseInASentence( value: any ): any {
    let formattedValue = value;

        // TODO: l10n / i18n
    if ( value instanceof LocalTime ) {
        formattedValue = value.format( DateTimeFormatter.ofPattern( 'HH:mm' ) ).toString();
    } else if ( value instanceof LocalDate ) {
        formattedValue = value.format( DateTimeFormatter.ofPattern( 'dd/MM/yyyy' ) ).toString();
    } else if ( value instanceof LocalDateTime ) {
        formattedValue = value.format( DateTimeFormatter.ofPattern( 'dd/MM/yyyy HH:mm' ) ).toString();
    }
    return 'number' === typeof formattedValue
        ? formattedValue
        : Symbols.VALUE_WRAPPER + formattedValue + Symbols.VALUE_WRAPPER;
}