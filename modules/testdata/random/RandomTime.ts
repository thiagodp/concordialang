import { RandomLong } from "./RandomLong";
import { LocalTime, ChronoUnit } from "js-joda";
import { TimeLimits } from "../limits/TimeLimits";

export class RandomTime {

    constructor( private _randomLong: RandomLong ) {
    }

    /**
     * Returns a random time between two given values, both inclusive.
     * 
     * @param min Minimum time
     * @param max Maximum time
     */
    public between( min: LocalTime, max: LocalTime ): LocalTime {
        const diffInSeconds: number = min.until( max, ChronoUnit.SECONDS );
        const seconds = this._randomLong.between( 0, diffInSeconds );
        return min.plusSeconds( seconds );
    }

    /**
     * Returns a random time before the given time.
     * 
     * @param max Maximum time
     */
    public before( max: LocalTime ): LocalTime {
        return this.between( TimeLimits.MIN, max.minusSeconds( 1 ) );
    }

    /**
     * Returns a random time after the given time.
     * 
     * @param min Minimum time
     */
    public after( min: LocalTime ): LocalTime {
        return this.between( min.plusSeconds( 1 ), TimeLimits.MAX );
    }
    
}