import { ChronoUnit } from "@js-joda/core";
import { ShortTimeLimits } from "../limits/TimeLimits";
/**
 * Generates random short time values.
 *
 * @author Thiago Delgado Pinto
 */
export class RandomShortTime {
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
        const diffInMinutes = min.until(max, ChronoUnit.MINUTES);
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
        return this.between(ShortTimeLimits.MIN, max.minusMinutes(1));
    }
    /**
     * Returns a random short time after the given time.
     *
     * @param min Minimum time
     */
    after(min) {
        return this.between(min.plusMinutes(1), ShortTimeLimits.MAX);
    }
}
