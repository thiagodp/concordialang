import { LocalDateTime } from "@js-joda/core";
/**
 * Limits for datetime values. Ignores milliseconds.
 *
 * @author Thiago Delgado Pinto
 */
export class DateTimeLimits {
}
DateTimeLimits.MIN = LocalDateTime.of(0, 1, 1, 0, 0, 0); // 0000-01-01 00:00:00
DateTimeLimits.MAX = LocalDateTime.of(9999, 12, 31, 23, 59, 59); // 9999-12-31 23:59:59.0
/**
 * Limits for short datetime values. Ignores seconds.
 *
 * @author Thiago Delgado Pinto
 */
export class ShortDateTimeLimits {
}
ShortDateTimeLimits.MIN = LocalDateTime.of(0, 1, 1, 0, 0); // 0000-01-01 00:00
ShortDateTimeLimits.MAX = LocalDateTime.of(9999, 12, 31, 23, 59); // 9999-12-31 23:59
