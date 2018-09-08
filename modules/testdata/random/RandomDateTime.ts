import { ChronoUnit, LocalDateTime } from 'js-joda';

import { DateTimeLimits } from '../limits/DateTimeLimits';
import { RandomLong } from './RandomLong';

/**
 * Generates random datetime values.
 *
 * @author Thiago Delgado Pinto
 */
export class RandomDateTime {

    constructor( private _randomLong: RandomLong ) {
    }

    /**
     * Returns a random date time between two given values, both inclusive.
     *
     * @param min Minimum date time
     * @param max Maximum date time
     */
    public between( min: LocalDateTime, max: LocalDateTime ): LocalDateTime {
        const diffInSeconds: number = min.until( max, ChronoUnit.SECONDS );
        if ( 0 === diffInSeconds ) {
            return min;
        }
        const seconds = this._randomLong.between( 0, diffInSeconds );
        return min.plusSeconds( seconds );
    }

    /**
     * Returns a random date time before the given date time.
     *
     * @param max Maximum date time
     */
    public before( max: LocalDateTime ): LocalDateTime {
        return this.between( DateTimeLimits.MIN, max.minusSeconds( 1 ) );
    }

    /**
     * Returns a random date time after the given date time.
     *
     * @param min Minimum date time
     */
    public after( min: LocalDateTime ): LocalDateTime {
        return this.between( min.plusSeconds( 1 ), DateTimeLimits.MAX );
    }
}