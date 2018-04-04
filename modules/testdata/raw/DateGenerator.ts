import { RawDataGenerator } from "./RawDataGenerator";
import { DateLimits } from "../limits/DateLimits";
import { RandomDate } from "../random/RandomDate";
import { isDefined } from '../../util/TypeChecking';
import { LocalDate, Period } from "js-joda";
import { RangeAnalyzer } from "./RangeAnalyzer";

export class DateGenerator implements RawDataGenerator< LocalDate >, RangeAnalyzer {

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
		if ( isDefined( min ) && isDefined( max ) && min.isAfter( max ) ) {
            throw new Error( 'min date should not be greater than max' );
        }
        this._min = isDefined( min ) ? min: DateLimits.MIN;
		this._max = isDefined( max ) ? max: DateLimits.MAX;
    }


	public diffInDays(): number {
        return Period.between( this._min, this._max ).days();
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
		const ZERO = DateLimits.MIN;
		return ( this._min.isBefore( ZERO ) || this._min.isEqual( ZERO ) )
			&& ( this._max.isAfter( ZERO ) || this._max.isEqual( ZERO ) );
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