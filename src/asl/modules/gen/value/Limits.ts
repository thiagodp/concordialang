import { LocalTime, LocalDate, Year, LocalDateTime } from 'js-joda';

/**
 * Limits for some value types.
 */
export abstract class Limits {

    static MAX_INT: number = Number.MAX_SAFE_INTEGER;
    static MIN_INT: number = Number.MIN_SAFE_INTEGER;

    static MAX_FLOAT: number = Number.MAX_SAFE_INTEGER;
    static MIN_FLOAT: number = Number.MIN_SAFE_INTEGER;

    static MIN_STRING: number = 0;
    static MAX_STRING: number = 32767; // max short
    // Since MAX_STRING can produce very long strings for testing purposes, we are also defining
    // a "usual" maximum length value.
    static MAX_USUAL_STRING: number = 127; // max byte

    static MIN_TIME: LocalTime = LocalTime.of( 0, 0, 0, 0 ); // 00:00:00.000
    static MAX_TIME: LocalTime = LocalTime.of( 23, 59, 59, 999 ); // 23:59:59.999

    static MIN_DATE: LocalDate = LocalDate.of( 0, 1, 1 ); // 0000-01-01
    static MAX_DATE: LocalDate = LocalDate.of( 9999, 12, 31 ); // 9999-12-31

    static MIN_DATETIME: LocalDateTime = LocalDateTime.of( 0, 1, 1, 0, 0, 0, 0 ); // 0000-01-01 00:00:00.000
    static MAX_DATETIME: LocalDateTime = LocalDateTime.of( 9999, 12, 31, 23, 59, 59, 999 ); // 9999-12-31 23:59:59.999

}