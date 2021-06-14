import { ChronoUnit } from "@js-joda/core";
import { DateLimits } from "../limits/DateLimits";
/**
 * Generates random date values.
 *
 * @author Thiago Delgado Pinto
 */
export class RandomDate {
    constructor(_randomLong) {
        this._randomLong = _randomLong;
    }
    /**
     * Returns a random date between two given dates, both inclusive.
     *
     * @param min Minimum date
     * @param max Maximum date
     */
    between(min, max) {
        const daysBetween = min.until(max, ChronoUnit.DAYS);
        if (0 === daysBetween) {
            return min;
        }
        const days = this._randomLong.between(0, daysBetween);
        return min.plusDays(days);
    }
    /**
     * Returns a random date before the given date.
     *
     * @param max Maximum date
     */
    before(max) {
        return this.between(DateLimits.MIN, max.minusDays(1));
    }
    /**
     * Returns a random date after the given date.
     *
     * @param min Minimum date
     */
    after(min) {
        return this.between(min.plusDays(1), DateLimits.MAX);
    }
}
