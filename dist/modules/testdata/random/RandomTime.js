"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@js-joda/core");
const TimeLimits_1 = require("../limits/TimeLimits");
/**
 * Generates random time values.
 *
 * @author Thiago Delgado Pinto
 */
class RandomTime {
    constructor(_randomLong) {
        this._randomLong = _randomLong;
    }
    /**
     * Returns a random time between two given values, both inclusive.
     *
     * @param min Minimum time
     * @param max Maximum time
     */
    between(min, max) {
        const diffInSeconds = min.until(max, core_1.ChronoUnit.SECONDS);
        if (0 === diffInSeconds) {
            return min;
        }
        const seconds = this._randomLong.between(0, diffInSeconds);
        return min.plusSeconds(seconds);
    }
    /**
     * Returns a random time before the given time.
     *
     * @param max Maximum time
     */
    before(max) {
        return this.between(TimeLimits_1.TimeLimits.MIN, max.minusSeconds(1));
    }
    /**
     * Returns a random time after the given time.
     *
     * @param min Minimum time
     */
    after(min) {
        return this.between(min.plusSeconds(1), TimeLimits_1.TimeLimits.MAX);
    }
}
exports.RandomTime = RandomTime;
