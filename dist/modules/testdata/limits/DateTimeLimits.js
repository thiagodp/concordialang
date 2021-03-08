"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortDateTimeLimits = exports.DateTimeLimits = void 0;
const core_1 = require("@js-joda/core");
/**
 * Limits for datetime values. Ignores milliseconds.
 *
 * @author Thiago Delgado Pinto
 */
class DateTimeLimits {
}
exports.DateTimeLimits = DateTimeLimits;
DateTimeLimits.MIN = core_1.LocalDateTime.of(0, 1, 1, 0, 0, 0); // 0000-01-01 00:00:00
DateTimeLimits.MAX = core_1.LocalDateTime.of(9999, 12, 31, 23, 59, 59); // 9999-12-31 23:59:59.0
/**
 * Limits for short datetime values. Ignores seconds.
 *
 * @author Thiago Delgado Pinto
 */
class ShortDateTimeLimits {
}
exports.ShortDateTimeLimits = ShortDateTimeLimits;
ShortDateTimeLimits.MIN = core_1.LocalDateTime.of(0, 1, 1, 0, 0); // 0000-01-01 00:00
ShortDateTimeLimits.MAX = core_1.LocalDateTime.of(9999, 12, 31, 23, 59); // 9999-12-31 23:59
