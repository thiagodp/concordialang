"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateLimits = void 0;
const core_1 = require("@js-joda/core");
/**
 * Limits for date values.
 *
 * @author Thiago Delgado Pinto
 */
class DateLimits {
}
exports.DateLimits = DateLimits;
DateLimits.MIN = core_1.LocalDate.of(0, 1, 1); // 0000-01-01
DateLimits.MAX = core_1.LocalDate.of(9999, 12, 31); // 9999-12-31
