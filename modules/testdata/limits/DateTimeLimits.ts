import { LocalDateTime } from "@js-joda/core";

/**
 * Limits for datetime values. Ignores milliseconds.
 *
 * @author Thiago Delgado Pinto
 */
export abstract class DateTimeLimits {
    static MIN: LocalDateTime = LocalDateTime.of( 0, 1, 1, 0, 0, 0 ); // 0000-01-01 00:00:00
    static MAX: LocalDateTime = LocalDateTime.of( 9999, 12, 31, 23, 59, 59 ); // 9999-12-31 23:59:59.0
}

/**
 * Limits for short datetime values. Ignores seconds.
 *
 * @author Thiago Delgado Pinto
 */
export abstract class ShortDateTimeLimits {
    static MIN: LocalDateTime = LocalDateTime.of( 0, 1, 1, 0, 0 ); // 0000-01-01 00:00
    static MAX: LocalDateTime = LocalDateTime.of( 9999, 12, 31, 23, 59 ); // 9999-12-31 23:59
}
