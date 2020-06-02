"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomShortDateTime = void 0;
const core_1 = require("@js-joda/core");
const DateTimeLimits_1 = require("../limits/DateTimeLimits");
/**
 * Generates random short datetime values.
 *
 * @author Thiago Delgado Pinto
 */
class RandomShortDateTime {
    constructor(_randomLong) {
        this._randomLong = _randomLong;
    }
    /**
     * Returns a random short datetime between two given values, both inclusive.
     *
     * @param min Minimum date time
     * @param max Maximum date time
     */
    between(min, max) {
        const diffInMinutes = min.until(max, core_1.ChronoUnit.MINUTES);
        if (0 === diffInMinutes) {
            return min;
        }
        const minutes = this._randomLong.between(0, diffInMinutes);
        return min.plusMinutes(minutes);
    }
    /**
     * Returns a random short datetime before the given date time.
     *
     * @param max Maximum date time
     */
    before(max) {
        return this.between(DateTimeLimits_1.ShortDateTimeLimits.MIN, max.minusMinutes(1));
    }
    /**
     * Returns a random short datetime after the given date time.
     *
     * @param min Minimum date time
     */
    after(min) {
        return this.between(min.plusMinutes(1), DateTimeLimits_1.ShortDateTimeLimits.MAX);
    }
}
exports.RandomShortDateTime = RandomShortDateTime;
