"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeLimits = void 0;
const core_1 = require("@js-joda/core");
/**
 * Limits for date values.
 *
 * @author Thiago Delgado Pinto
 */
class TimeLimits {
}
exports.TimeLimits = TimeLimits;
TimeLimits.MIN = core_1.LocalTime.of(0, 0, 0, 0); // 00:00:00.000
TimeLimits.MAX = core_1.LocalTime.of(23, 59, 59, 999); // 23:59:59.999
