import { LocalTime } from "@js-joda/core";

/**
 * Limits for time values. Milliseconds are ignored.
 *
 * @author Thiago Delgado Pinto
 */
export abstract class TimeLimits {
    static MIN: LocalTime = LocalTime.of( 0, 0, 0 ); // 00:00:00.000
    static MAX: LocalTime = LocalTime.of( 23, 59, 59 ); // 23:59:59.000
}

/**
 * Limits for short time values. Seconds are ignored.
 *
 * @author Thiago Delgado Pinto
 */
export abstract class ShortTimeLimits {
    static MIN: LocalTime = LocalTime.of( 0, 0, 0, 0 ); // 00:00:00.000
    static MAX: LocalTime = LocalTime.of( 23, 59, 0, 0 ); // 23:59:00.0
}
