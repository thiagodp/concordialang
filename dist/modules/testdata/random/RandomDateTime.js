"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@js-joda/core");
const DateTimeLimits_1 = require("../limits/DateTimeLimits");
/**
 * Generates random datetime values.
 *
 * @author Thiago Delgado Pinto
 */
class RandomDateTime {
    constructor(_randomLong) {
        this._randomLong = _randomLong;
    }
    /**
     * Returns a random date time between two given values, both inclusive.
     *
     * @param min Minimum date time
     * @param max Maximum date time
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
     * Returns a random date time before the given date time.
     *
     * @param max Maximum date time
     */
    before(max) {
        return this.between(DateTimeLimits_1.DateTimeLimits.MIN, max.minusSeconds(1));
    }
    /**
     * Returns a random date time after the given date time.
     *
     * @param min Minimum date time
     */
    after(min) {
        return this.between(min.plusSeconds(1), DateTimeLimits_1.DateTimeLimits.MAX);
    }
}
exports.RandomDateTime = RandomDateTime;
