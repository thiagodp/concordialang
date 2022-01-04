import { ChronoUnit, LocalDate } from "@js-joda/core";
import { isDefined } from '../../util/type-checking';
import { DateLimits } from "../limits/DateLimits";
import { RandomDate } from "../random/RandomDate";
import { RangeAnalyzer } from "./RangeAnalyzer";
import { RawDataGenerator } from "./RawDataGenerator";

export class DateGenerator implements RawDataGenerator< LocalDate >, RangeAnalyzer {

	public readonly ZERO = DateLimits.MIN;

    private readonly _min: LocalDate;
	private readonly _max: LocalDate;

	/**
	 * Constructor.
	 *
	 * @param _randomDateGen Random generator.
	 * @param min Minimum value. Optional. Assumes the minimum date if not defined.
	 * @param max Maximum value. Optional. Assumes the maximum date if not defined.
	 *
	 * @throws Error In case of invalid values.
	 */
    constructor(
		private _randomDateGen: RandomDate,
		min?: LocalDate,
		max?: LocalDate
	) {
		if ( isDefined( min ) && isDefined( max ) && min!.isAfter( max! ) ) {
            throw new Error( 'min date should not be greater than max' );
        }
        this._min = isDefined( min ) ? min! : DateLimits.MIN;
		this._max = isDefined( max ) ? max! : DateLimits.MAX;
    }


	public diffInDays(): number {
		return this._min.until( this._max, ChronoUnit.DAYS );
	}

	// RANGE ANALYSIS

	/** @inheritDoc */
	public hasValuesBetweenMinAndMax(): boolean {
		return this.diffInDays() > 0;
	}

	/** @inheritDoc */
	public hasValuesBelowMin(): boolean {
		return this._min.isAfter( DateLimits.MIN );
	}

	/** @inheritDoc */
	public hasValuesAboveMax(): boolean {
        return this._max.isBefore( DateLimits.MAX );
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
	public lowest(): LocalDate {
		return DateLimits.MIN;
    }

    /** @inheritDoc */
	public randomBelowMin(): LocalDate {
		return ( this.hasValuesBelowMin() )
			? this._randomDateGen.before( this._min )
			: this.lowest();
    }

    /** @inheritDoc */
	public justBelowMin(): LocalDate {
		return ( this.hasValuesBelowMin() )
			? this._min.minusDays( 1 )
			: this.lowest();
    }

    /** @inheritDoc */
	public min(): LocalDate {
		return this._min;
    }

    /** @inheritDoc */
	public justAboveMin(): LocalDate {
		return ( this.hasValuesBetweenMinAndMax() )
			? this._min.plusDays( 1 )
			: this._min;
    }

    /** @inheritDoc */
    public zero(): LocalDate {
        return this.lowest();
    }

    /** @inheritDoc */
	public median(): LocalDate {
		return this._min.plusDays( Math.round( ( this.diffInDays() - 1 ) / 2 ) );
    }

    /** @inheritDoc */
	public randomBetweenMinAndMax(): LocalDate {
        return this.hasValuesBetweenMinAndMax()
            ? this._randomDateGen.between( this._min.plusDays( 1 ), this._max.minusDays( 1 ) )
            : this._min;
    }

    /** @inheritDoc */
    public justBelowMax(): LocalDate {
        return this.hasValuesBetweenMinAndMax()
            ? this._max.minusDays( 1 )
            : this._max;
    }

    /** @inheritDoc */
	public max(): LocalDate {
		return this._max;
    }

    /** @inheritDoc */
    public justAboveMax(): LocalDate {
        return this.hasValuesAboveMax()
            ? this._max.plusDays( 1 )
            : this.greatest();
	}

    /** @inheritDoc */
	public randomAboveMax(): LocalDate {
		return this.hasValuesAboveMax()
			? this._randomDateGen.after( this._max )
			: this.greatest();
	}

	/** @inheritDoc */
	public greatest(): LocalDate {
		return DateLimits.MAX;
	}

}
