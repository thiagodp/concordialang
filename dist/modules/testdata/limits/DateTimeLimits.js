"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_joda_1 = require("js-joda");
/**
 * Limits for datetime values.
 *
 * @author Thiago Delgado Pinto
 */
class DateTimeLimits {
}
exports.DateTimeLimits = DateTimeLimits;
DateTimeLimits.MIN = js_joda_1.LocalDateTime.of(0, 1, 1, 0, 0, 0, 0); // 0000-01-01 00:00:00.000
DateTimeLimits.MAX = js_joda_1.LocalDateTime.of(9999, 12, 31, 23, 59, 59, 999); // 9999-12-31 23:59:59.999
