import { ChronoUnit, LocalTime } from "@js-joda/core";
import { ShortTimeLimits } from "../limits/TimeLimits";
import { RandomLong } from "./RandomLong";

/**
 * Generates random short time values.
 *
 * @author Thiago Delgado Pinto
 */
export class RandomShortTime {

    constructor( private _randomLong: RandomLong ) {
    }

    /**
     * Returns a random short time between two given values, both inclusive.
     *
     * @param min Minimum time
     * @param max Maximum time
     */
    public between( min: LocalTime, max: LocalTime ): LocalTime {
        const diffInMinutes: number = min.until( max, ChronoUnit.MINUTES );
        if ( 0 === diffInMinutes ) {
            return min;
        }
        const minutes = this._randomLong.between( 0, diffInMinutes );
        return min.plusMinutes( minutes );
    }

    /**
     * Returns a random short time before the given time.
     *
     * @param max Maximum time
     */
    public before( max: LocalTime ): LocalTime {
        return this.between( ShortTimeLimits.MIN, max.minusMinutes( 1 ) );
    }

    /**
     * Returns a random short time after the given time.
     *
     * @param min Minimum time
     */
    public after( min: LocalTime ): LocalTime {
        return this.between( min.plusMinutes( 1 ), ShortTimeLimits.MAX );
    }

}