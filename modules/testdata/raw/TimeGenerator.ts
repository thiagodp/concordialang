import { ChronoUnit, LocalTime } from "@js-joda/core";
import { isDefined } from '../../util/type-checking';
import { TimeLimits } from "../limits/TimeLimits";
import { RandomTime } from "../random/RandomTime";
import { RangeAnalyzer } from "./RangeAnalyzer";
import { RawDataGenerator } from "./RawDataGenerator";

export class TimeGenerator implements RawDataGenerator< LocalTime >, RangeAnalyzer {

	public readonly ZERO = TimeLimits.MIN;

    private readonly _min: LocalTime;
    private readonly _max: LocalTime;

	/**
	 * Constructor.
	 *
	 * @param _randomTimeGen Random generator.
	 * @param min Minimum value. Optional. Assumes the minimum time if not defined.
	 * @param max Maximum value. Optional. Assumes the maximum time if not defined.
	 *
	 * @throws Error In case of invalid values.
	 */
    constructor(
		private _randomTimeGen: RandomTime,
		min?: LocalTime,
		max?: LocalTime
	) {
		if ( isDefined( min ) && isDefined( max ) && min!.isAfter( max! ) ) {
            throw new Error( 'min time should not be greater than max' );
        }
        this._min = isDefined( min ) ? min! : TimeLimits.MIN;
		this._max = isDefined( max ) ? max! : TimeLimits.MAX;
    }


	public diffInSeconds(): number {
		return this._min.until( this._max, ChronoUnit.SECONDS );
	}

	// RANGE ANALYSIS

	/** @inheritDoc */
	public hasValuesBetweenMinAndMax(): boolean {
		return this.diffInSeconds() > 0;
	}

	/** @inheritDoc */
	public hasValuesBelowMin(): boolean {
		return this._min.isAfter( TimeLimits.MIN );
	}

	/** @inheritDoc */
	public hasValuesAboveMax(): boolean {
        return this._max.isBefore( TimeLimits.MAX );
	}

	/** @inheritDoc */
	public isZeroBetweenMinAndMax(): boolean {
		return ( this._min.isBefore( this.ZERO ) || this._min.equals( this.ZERO ) )
			&& ( this._max.isAfter( this.ZERO ) || this._max.equals( this.ZERO ) );
	}

	/** @inheritDoc */
    public isZeroBelowMin(): boolean {
		return this._min.isAfter( this.ZERO );
	}

	/** @inheritDoc */
    public isZeroAboveMax(): boolean {
		return this._max.isBefore( this.ZERO );
	}

	// DATA GENERATION

	/** @inheritDoc */
	public lowest(): LocalTime {
		return TimeLimits.MIN;
    }

    /** @inheritDoc */
	public randomBelowMin(): LocalTime {
		return ( this.hasValuesBelowMin() )
			? this._randomTimeGen.before( this._min )
			: this.lowest();
    }

    /** @inheritDoc */
	public justBelowMin(): LocalTime {
		return ( this.hasValuesBelowMin() )
			? this._min.minusSeconds( 1 )
			: this.lowest();
    }

    /** @inheritDoc */
	public min(): LocalTime {
		return this._min;
    }

    /** @inheritDoc */
	public justAboveMin(): LocalTime {
		return ( this.hasValuesBetweenMinAndMax() )
			? this._min.plusSeconds( 1 )
			: this._min;
    }

    /** @inheritDoc */
    public zero(): LocalTime {
        return this.lowest();
    }

    /** @inheritDoc */
	public median(): LocalTime {
		return this._min.plusSeconds( Math.round( ( this.diffInSeconds() - 1 ) / 2 ) );
    }

    /** @inheritDoc */
	public randomBetweenMinAndMax(): LocalTime {
        return this.hasValuesBetweenMinAndMax()
            ? this._randomTimeGen.between( this._min.plusSeconds( 1 ), this._max.minusSeconds( 1 ) )
            : this._min;
    }

    /** @inheritDoc */
    public justBelowMax(): LocalTime {
        return this.hasValuesBetweenMinAndMax()
            ? this._max.minusSeconds( 1 )
            : this._max;
    }

    /** @inheritDoc */
	public max(): LocalTime {
		return this._max;
    }

    /** @inheritDoc */
    public justAboveMax(): LocalTime {
        return this.hasValuesAboveMax()
            ? this._max.plusSeconds( 1 )
            : this.greatest();
	}

    /** @inheritDoc */
	public randomAboveMax(): LocalTime {
		return this.hasValuesAboveMax()
			? this._randomTimeGen.after( this._max )
			: this.greatest();
	}

	/** @inheritDoc */
	public greatest(): LocalTime {
		return TimeLimits.MAX;
	}

}
