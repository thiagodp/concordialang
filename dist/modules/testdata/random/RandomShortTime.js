"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@js-joda/core");
const TimeLimits_1 = require("../limits/TimeLimits");
/**
 * Generates random short time values.
 *
 * @author Thiago Delgado Pinto
 */
class RandomShortTime {
    constructor(_randomLong) {
        this._randomLong = _randomLong;
    }
    /**
     * Returns a random short time between two given values, both inclusive.
     *
     * @param min Minimum time
     * @param max Maximum time
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
     * Returns a random short time before the given time.
     *
     * @param max Maximum time
     */
    before(max) {
        return this.between(TimeLimits_1.ShortTimeLimits.MIN, max.minusMinutes(1));
    }
    /**
     * Returns a random short time after the given time.
     *
     * @param min Minimum time
     */
    after(min) {
        return this.between(min.plusMinutes(1), TimeLimits_1.ShortTimeLimits.MAX);
    }
}
exports.RandomShortTime = RandomShortTime;
