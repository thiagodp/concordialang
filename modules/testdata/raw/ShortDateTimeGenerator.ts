import { ChronoUnit, LocalDateTime } from '@js-joda/core';

import { isDefined } from '../../util/type-checking';
import { ShortDateTimeLimits } from '../limits/DateTimeLimits';
import { RandomShortDateTime } from '../random/RandomShortDateTime';
import { RawDataGenerator } from './RawDataGenerator';

export class ShortDateTimeGenerator implements RawDataGenerator< LocalDateTime > {

	public readonly ZERO = ShortDateTimeLimits.MIN;

    private readonly _min: LocalDateTime;
    private readonly _max: LocalDateTime;

	/**
	 * Constructor.
	 *
	 * @param _randomGen Random generator.
	 * @param min Minimum value. Optional. Assumes the minimum datetime if not defined.
	 * @param max Maximum value. Optional. Assumes the maximum datetime if not defined.
	 *
	 * @throws Error In case of invalid values.
	 */
    constructor(
		private _randomGen: RandomShortDateTime,
		min?: LocalDateTime,
		max?: LocalDateTime
	) {
		if ( isDefined( min ) && isDefined( max ) && min!.isAfter( max! ) ) {
            throw new Error( 'Minimum value should not be greater than the maximum value.' );
        }
        this._min = isDefined( min ) ? min! : ShortDateTimeLimits.MIN;
		this._max = isDefined( max ) ? max! : ShortDateTimeLimits.MAX;
    }

	public diffInMinutes(): number {
        return this._min.until( this._max, ChronoUnit.MINUTES );
	}

	// RANGE ANALYSIS

	/** @inheritDoc */
	public hasValuesBetweenMinAndMax(): boolean {
		return this.diffInMinutes() > 0;
	}

	/** @inheritDoc */
	public hasValuesBelowMin(): boolean {
		return this._min.isAfter( ShortDateTimeLimits.MIN );
	}

	/** @inheritDoc */
	public hasValuesAboveMax(): boolean {
        return this._max.isBefore( ShortDateTimeLimits.MAX );
	}

	/** @inheritDoc */
	public isZeroBetweenMinAndMax(): boolean {
		return ( this._min.isBefore( this.ZERO ) || this._min.isEqual( this.ZERO ) )
			&& ( this._max.isAfter( this.ZERO ) || this._max.isEqual( this.ZERO ) );
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
	public lowest(): LocalDateTime {
		return ShortDateTimeLimits.MIN;
    }

    /** @inheritDoc */
	public randomBelowMin(): LocalDateTime {
		return ( this.hasValuesBelowMin() )
			? this._randomGen.before( this._min )
			: this.lowest();
    }

    /** @inheritDoc */
	public justBelowMin(): LocalDateTime {
		return ( this.hasValuesBelowMin() )
			? this._min.minusMinutes( 1 )
			: this.lowest();
    }

    /** @inheritDoc */
	public min(): LocalDateTime {
		return this._min;
    }

    /** @inheritDoc */
	public justAboveMin(): LocalDateTime {
		return ( this.hasValuesBetweenMinAndMax() )
			? this._min.plusMinutes( 1 )
			: this._min;
    }

    /** @inheritDoc */
    public zero(): LocalDateTime {
        return this.lowest();
    }

    /** @inheritDoc */
	public median(): LocalDateTime {
		// const diffInDaysOfDates = Period.between( this._min.toLocalDate(), this._max.toLocalDate() ).days();
		const diffInDaysOfDates = this._min.toLocalDate().until( this._max.toLocalDate(), ChronoUnit.DAYS );

        const minTime = this._min.toLocalTime();
        const maxTime = this._max.toLocalTime();
        const diffInMinutesFromTime = minTime.until( maxTime, ChronoUnit.MINUTES );

        const days = Math.round( ( diffInDaysOfDates - 1 ) / 2 );
        const minutes = Math.round( ( diffInMinutesFromTime - 1 ) / 2 );

        let r = this._min.plusDays( days );
        if ( maxTime.compareTo( minTime ) > 0 ) { // maxTime greater than minTime
            return r.plusMinutes( minutes );
        }
        return r.minusMonths( minutes );
    }

    /** @inheritDoc */
	public randomBetweenMinAndMax(): LocalDateTime {
        return this.hasValuesBetweenMinAndMax()
            ? this._randomGen.between( this._min.plusMinutes( 1 ), this._max.minusMinutes( 1 ) )
            : this._min;
    }

    /** @inheritDoc */
    public justBelowMax(): LocalDateTime {
        return this.hasValuesBetweenMinAndMax()
            ? this._max.minusMinutes( 1 )
            : this._max;
    }

    /** @inheritDoc */
	public max(): LocalDateTime {
		return this._max;
    }

    /** @inheritDoc */
    public justAboveMax(): LocalDateTime {
        return this.hasValuesAboveMax()
            ? this._max.plusMinutes( 1 )
            : this.greatest();
	}

    /** @inheritDoc */
	public randomAboveMax(): LocalDateTime {
		return this.hasValuesAboveMax()
			? this._randomGen.after( this._max )
			: this.greatest();
	}

	/** @inheritDoc */
	public greatest(): LocalDateTime {
		return ShortDateTimeLimits.MAX;
	}

}
