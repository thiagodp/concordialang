import { ChronoUnit } from "@js-joda/core";
import { DateTimeLimits } from '../limits/DateTimeLimits';
/**
 * Generates random datetime values.
 *
 * @author Thiago Delgado Pinto
 */
export class RandomDateTime {
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
        const diffInSeconds = min.until(max, ChronoUnit.SECONDS);
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
        return this.between(DateTimeLimits.MIN, max.minusSeconds(1));
    }
    /**
     * Returns a random date time after the given date time.
     *
     * @param min Minimum date time
     */
    after(min) {
        return this.between(min.plusSeconds(1), DateTimeLimits.MAX);
    }
}
