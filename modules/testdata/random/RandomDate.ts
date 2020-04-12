import { ChronoUnit, LocalDate } from "@js-joda/core";
import { DateLimits } from "../limits/DateLimits";
import { RandomLong } from "./RandomLong";

/**
 * Generates random date values.
 *
 * @author Thiago Delgado Pinto
 */
export class RandomDate {

    constructor( private _randomLong: RandomLong ) {
    }

    /**
     * Returns a random date between two given dates, both inclusive.
     *
     * @param min Minimum date
     * @param max Maximum date
     */
    public between( min: LocalDate, max: LocalDate ): LocalDate {
        const daysBetween: number = min.until( max, ChronoUnit.DAYS );
        if ( 0 === daysBetween ) {
            return min;
        }
        const days: number = this._randomLong.between( 0, daysBetween );
        return min.plusDays( days );
    }

    /**
     * Returns a random date before the given date.
     *
     * @param max Maximum date
     */
    public before( max: LocalDate ): LocalDate {
        return this.between( DateLimits.MIN, max.minusDays( 1 ) );
    }

    /**
     * Returns a random date after the given date.
     *
     * @param min Minimum date
     */
    public after( min: LocalDate ): LocalDate {
        return this.between( min.plusDays( 1 ), DateLimits.MAX );
    }

}