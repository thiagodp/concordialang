import { DefaultValueGenerator } from './DefaultValueGenerator';
import { Limits } from './Limits';
import { LongRandom } from './LongRandom';

/**
 * Long value generator.
 */
export class LongValueGenerator extends DefaultValueGenerator< number > {

    private _min: number;
    private _max: number;
    private _random: LongRandom;

    constructor( min?: number, max?: number ) {
        super();
        this._min = min !== undefined ? min: Limits.MIN_INT;
        this._max = max !== undefined ? max: Limits.MAX_INT;
        this._random = new LongRandom();
    }

    public hasAvailableValuesOutOfTheRange(): boolean {
		return this._min > Limits.MIN_INT || this._max < Limits.MAX_INT;		
	}

	public min(): number {
		return this._min;
	}

	public max(): number {
		return this._max;
	}

	protected zero(): number {
		return ( 0 >= this._min && 0 <= this._max ) ? 0 : this._min;
	}

	protected middle(): number {
		return this._min + ( ( this._max - this._min ) / 2 );
	}
	
	protected hasNext( value: number ): boolean {	
		return value < this._max;
	}	

	protected next( value: number ): number {
		return value + 1;
	}
	
	protected hasPrior( value: number ): boolean {
		return this._min < value;
	}

	protected prior( value: number ): number {
		return value - 1;
	}

	protected randomBefore( value: number ): number {
		return this._random.before( value );
	}

	protected randomAfter( value: number ): number {
		return this._random.after( value );
	}
	
	protected hasAnyValueBetween( min: number, max: number ): boolean {
		return ( max - min ) > 0;
	}

	protected randomBetween( min: number, max: number ): number {
		return this._random.between( min, max );
	}    

}