import { LocalTime } from "@js-joda/core";
/**
 * Limits for time values. Milliseconds are ignored.
 *
 * @author Thiago Delgado Pinto
 */
export class TimeLimits {
}
TimeLimits.MIN = LocalTime.of(0, 0, 0); // 00:00:00.000
TimeLimits.MAX = LocalTime.of(23, 59, 59); // 23:59:59.000
/**
 * Limits for short time values. Seconds are ignored.
 *
 * @author Thiago Delgado Pinto
 */
export class ShortTimeLimits {
}
ShortTimeLimits.MIN = LocalTime.of(0, 0, 0, 0); // 00:00:00.000
ShortTimeLimits.MAX = LocalTime.of(23, 59, 0, 0); // 23:59:00.0
