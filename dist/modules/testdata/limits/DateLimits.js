"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_joda_1 = require("js-joda");
/**
 * Limits for date values.
 *
 * @author Thiago Delgado Pinto
 */
class DateLimits {
}
DateLimits.MIN = js_joda_1.LocalDate.of(0, 1, 1); // 0000-01-01
DateLimits.MAX = js_joda_1.LocalDate.of(9999, 12, 31); // 9999-12-31
exports.DateLimits = DateLimits;
