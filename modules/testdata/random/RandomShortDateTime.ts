import { ChronoUnit, LocalDateTime } from "@js-joda/core";
import { ShortDateTimeLimits } from '../limits/DateTimeLimits';
import { RandomLong } from './RandomLong';


/**
 * Generates random short datetime values.
 *
 * @author Thiago Delgado Pinto
 */
export class RandomShortDateTime {

    constructor( private _randomLong: RandomLong ) {
    }

    /**
     * Returns a random short datetime between two given values, both inclusive.
     *
     * @param min Minimum date time
     * @param max Maximum date time
     */
    public between( min: LocalDateTime, max: LocalDateTime ): LocalDateTime {
        const diffInMinutes: number = min.until( max, ChronoUnit.MINUTES );
        if ( 0 === diffInMinutes ) {
            return min;
        }
        const minutes = this._randomLong.between( 0, diffInMinutes );
        return min.plusMinutes( minutes );
    }

    /**
     * Returns a random short datetime before the given date time.
     *
     * @param max Maximum date time
     */
    public before( max: LocalDateTime ): LocalDateTime {
        return this.between( ShortDateTimeLimits.MIN, max.minusMinutes( 1 ) );
    }

    /**
     * Returns a random short datetime after the given date time.
     *
     * @param min Minimum date time
     */
    public after( min: LocalDateTime ): LocalDateTime {
        return this.between( min.plusMinutes( 1 ), ShortDateTimeLimits.MAX );
    }
}