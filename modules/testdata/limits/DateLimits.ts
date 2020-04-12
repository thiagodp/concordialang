import { LocalDate } from "@js-joda/core";

/**
 * Limits for date values.
 *
 * @author Thiago Delgado Pinto
 */
export abstract class DateLimits {
    static MIN: LocalDate = LocalDate.of( 0, 1, 1 ); // 0000-01-01
    static MAX: LocalDate = LocalDate.of( 9999, 12, 31 ); // 9999-12-31
}