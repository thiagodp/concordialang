"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_joda_1 = require("js-joda");
/**
 * Limits for date values.
 *
 * @author Thiago Delgado Pinto
 */
class TimeLimits {
}
TimeLimits.MIN = js_joda_1.LocalTime.of(0, 0, 0, 0); // 00:00:00.000
TimeLimits.MAX = js_joda_1.LocalTime.of(23, 59, 59, 999); // 23:59:59.999
exports.TimeLimits = TimeLimits;
