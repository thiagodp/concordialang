import { LocalDate } from "@js-joda/core";
/**
 * Limits for date values.
 *
 * @author Thiago Delgado Pinto
 */
export class DateLimits {
}
DateLimits.MIN = LocalDate.of(0, 1, 1); // 0000-01-01
DateLimits.MAX = LocalDate.of(9999, 12, 31); // 9999-12-31
