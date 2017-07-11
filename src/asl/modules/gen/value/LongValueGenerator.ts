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

    /**
     * @inheritDoc
     */
    public hasAvailableValuesOutOfTheRange(): boolean {
		return this._min > Limits.MIN_INT || this._max < Limits.MAX_INT;		
	}

    /**
     * @inheritDoc
     */
	public min(): number {
		return this._min;
	}

    /**
     * @inheritDoc
     */
	public max(): number {
		return this._max;
	}

    /**
     * @inheritDoc
     */
	protected zero(): number {
		return ( 0 >= this._min && 0 <= this._max ) ? 0 : this._min;
	}

    /**
     * @inheritDoc
     */
	protected middle(): number {
		return this._min + ( ( this._max - this._min ) / 2 );
	}
	
    /**
     * @inheritDoc
     */    
	protected hasNext( value: number ): boolean {	
		return value < this._max;
	}	

    /**
     * @inheritDoc
     */
	protected next( value: number ): number {
		return value + 1;
	}
	
    /**
     * @inheritDoc
     */    
	protected hasPrior( value: number ): boolean {
		return this._min < value;
	}

    /**
     * @inheritDoc
     */
	protected prior( value: number ): number {
		return value - 1;
	}

    /**
     * @inheritDoc
     */
	protected randomBefore( value: number ): number {
		return this._random.before( value );
	}

    /**
     * @inheritDoc
     */
	protected randomAfter( value: number ): number {
		return this._random.after( value );
	}
	
    /**
     * @inheritDoc
     */    
	protected hasAnyValueBetween( min: number, max: number ): boolean {
		return ( max - min ) > 0;
	}

    /**
     * @inheritDoc
     */
	protected randomBetween( min: number, max: number ): number {
		return this._random.between( min, max );
	}    

}