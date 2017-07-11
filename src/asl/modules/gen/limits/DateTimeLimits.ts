import { LocalDateTime } from 'js-joda';

/**
 * Limits for date time values.
 */
export abstract class DateTimeLimits {

    static MIN: LocalDateTime = LocalDateTime.of( 0, 1, 1, 0, 0, 0, 0 ); // 0000-01-01 00:00:00.000
    static MAX: LocalDateTime = LocalDateTime.of( 9999, 12, 31, 23, 59, 59, 999 ); // 9999-12-31 23:59:59.999
}