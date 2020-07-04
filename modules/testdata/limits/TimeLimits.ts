import { LocalTime } from '@js-joda/core';

/**
 * Limits for date values.
 *
 * @author Thiago Delgado Pinto
 */
export abstract class TimeLimits {
    static MIN: LocalTime = LocalTime.of( 0, 0, 0, 0 ); // 00:00:00.000
    static MAX: LocalTime = LocalTime.of( 23, 59, 59, 999 ); // 23:59:59.999
}
