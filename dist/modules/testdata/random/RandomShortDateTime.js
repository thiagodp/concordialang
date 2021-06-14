import { ChronoUnit } from "@js-joda/core";
import { ShortDateTimeLimits } from '../limits/DateTimeLimits';
/**
 * Generates random short datetime values.
 *
 * @author Thiago Delgado Pinto
 */
export class RandomShortDateTime {
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
        const diffInMinutes = min.until(max, ChronoUnit.MINUTES);
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
        return this.between(ShortDateTimeLimits.MIN, max.minusMinutes(1));
    }
    /**
     * Returns a random short datetime after the given date time.
     *
     * @param min Minimum date time
     */
    after(min) {
        return this.between(min.plusMinutes(1), ShortDateTimeLimits.MAX);
    }
}
