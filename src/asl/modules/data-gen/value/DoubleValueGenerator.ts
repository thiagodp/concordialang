import { DefaultValueGenerator } from './DefaultValueGenerator';
import { RandomDouble } from '../random/RandomDouble';
import { DoubleLimits } from '../limits/DoubleLimits';

/**
 * Double value generator
 */
export class DoubleValueGenerator extends DefaultValueGenerator< number > {
	
	public static DEFAULT_DELTA: number = 0.01;
	
	private _min: number;
	private _max: number;
	private _delta: number;
	private _random: RandomDouble = new RandomDouble();
	
	/**
	 * Constructs with a minimum value, a maximum value and a delta value.
	 * 
	 * @param min	Minimum value. Assumes MIN_FLOAT if undefined.
	 * @param max	Maximum value. Assumes MAX_FLOAT if undefined.
	 * @param delta Precision used to generate new values. If undefined,
	 * 				it assumes the greatest fractional part between min and max.
	 */		
	public construct(
			min?: number,
			max?: number,
			delta?: number
			) {
		this.checkValues( min, max, delta ); // can throw Error
	
		this._min = ( undefined === min ) ? DoubleLimits.MIN : min;
		this._max = ( undefined === max ) ? DoubleLimits.MAX : max;
		this._delta = ( undefined === delta ) ? this.greatestFractionalPart( min, max ) : delta;
		
		if ( this._min > this._max ) {
			throw new Error( "min can't be greater than max." );
		}
	}

	/**
	 * Validate the given values.
	 * 
	 * @param min
	 * @param max 
	 * @param delta 
	 */
	private checkValues(
			min?: number,
			max?: number,
			delta?: number
			): void {
		// min
		if ( min !== undefined ) {
			if ( isNaN( min ) ) {
				throw new Error( "min is NaN." );
			}
			if ( ! isFinite( min ) ) {
				throw new Error( "min is Infinite." );
			}
		}
		// max
		if ( max !== undefined ) {			
			if ( isNaN( max ) ) {
				throw new Error( "max is NaN." );
			}
			if ( ! isFinite( max )  ) {
				throw new Error( "max is Infinite." );
			}
		}
		// delta
		if ( delta < 0 ) {
			throw new Error( "delta can't be negative." );
		}
	}
	
	/**
	 * Return the greatest fractional part.
	 * 
	 * @param min	The minimum value.
	 * @param max	The maximum value.
	 */
	private greatestFractionalPart( min?: number, max?: number ): number {
		if ( undefined === min && undefined === max ) { // both are undefined
			return DoubleValueGenerator.DEFAULT_DELTA;
		}
		let minStr: string = ( min !== undefined ) ? min.toString() : "";
		let maxStr: string = ( max !== undefined ) ? max.toString() : "";
		let restStr: string = minStr.length > maxStr.length ? minStr : maxStr;
		let restLen: number = restStr.length - "0.".length;
		let frac: number = 1 / Math.pow( 10, restLen );
		return frac;
	}
	
	public delta(): number {
		return this._delta;
	}

	/** @inheritDoc */
	public hasAvailableValuesOutOfTheRange(): boolean {
		return this._min > DoubleLimits.MIN || this._max < DoubleLimits.MAX;
	}	

	/** @inheritDoc */
	public min(): number {
		return this._min;
	}

	/** @inheritDoc */
	public max(): number {
		return this._max;
	}

	/** @inheritDoc */
	protected zero(): number {
		return ( 0 >= this._min && 0 <= this._max ) ? 0 : this._min;
	}

	/** @inheritDoc */
	protected middle(): number {
		return this._min + ( ( this._max - this._min ) / 2 );
	}

	/** @inheritDoc */
	protected hasNext( value: number ): boolean {
		return value < this._max;
	}
	
	/** @inheritDoc */
	protected next( value: number ): number  {
		return value + this._delta;
	}

	/** @inheritDoc */
	protected hasPrior( value: number ): boolean {
		return this._min < value; 
	}
	
	/** @inheritDoc */
	protected prior( value: number ): number {
		return value - this._delta;
	}

	/** @inheritDoc */
	protected randomBefore( value: number ): number {
		return this._random.before( value, this._delta );
	}

	/** @inheritDoc */
	protected randomAfter( value: number ): number {
		return this._random.after( value, this._delta );
	}

	/** @inheritDoc */
	protected hasAnyValueBetween( min: number, max: number ): boolean {
		return ( max - min ) > this._delta;
	}
	
	/** @inheritDoc */
	protected randomBetween( min: number, max: number ): number {
		return this._random.between( min, max );
	}

}