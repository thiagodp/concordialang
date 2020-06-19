"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortTimeLimits = exports.TimeLimits = void 0;
const core_1 = require("@js-joda/core");
/**
 * Limits for time values. Milliseconds are ignored.
 *
 * @author Thiago Delgado Pinto
 */
let TimeLimits = /** @class */ (() => {
    class TimeLimits {
    }
    TimeLimits.MIN = core_1.LocalTime.of(0, 0, 0); // 00:00:00.000
    TimeLimits.MAX = core_1.LocalTime.of(23, 59, 59); // 23:59:59.000
    return TimeLimits;
})();
exports.TimeLimits = TimeLimits;
/**
 * Limits for short time values. Seconds are ignored.
 *
 * @author Thiago Delgado Pinto
 */
let ShortTimeLimits = /** @class */ (() => {
    class ShortTimeLimits {
    }
    ShortTimeLimits.MIN = core_1.LocalTime.of(0, 0, 0, 0); // 00:00:00.000
    ShortTimeLimits.MAX = core_1.LocalTime.of(23, 59, 0, 0); // 23:59:00.0
    return ShortTimeLimits;
})();
exports.ShortTimeLimits = ShortTimeLimits;
