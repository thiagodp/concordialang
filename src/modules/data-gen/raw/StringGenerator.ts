import { RawDataGenerator } from "./RawDataGenerator";
import { RandomString } from "../random/RandomString";
import { MinMaxChecker } from "../util/MinMaxChecker";
import { StringLimits } from "../limits/StringLimits";

/**
 * String generator.
 * 
 * @author Thiago Delgado Pinto
 */
export class StringGenerator implements RawDataGenerator< string > {

    private readonly _minLength: number;
    private readonly _maxLength: number;

	/**
	 * Constructor.
	 * 
	 * @param _random   Random generator
	 * @param minLength Minimum length. Optional. Assumes the minimum string length if undefined.
	 * @param maxLength Maximum length. Optional. Assumes the usual maximum string length if undefined.
	 * 
	 * @throws Error In case of invalid values.
	 */    
    constructor(
        private readonly _randomString: RandomString,
        minLength?: number,
        maxLength?: number
    ) {
        ( new MinMaxChecker() ).check( minLength, maxLength ); // may throw Error

        // Aditional checkings
        if ( minLength && minLength < StringLimits.MIN ) {
            throw Error( 'Minimum string length is ' + StringLimits.MIN );
        }
        if ( maxLength && maxLength > StringLimits.MAX ) {
            throw Error( 'Maximum string length is ' + StringLimits.MAX );
        }        

        this._minLength = minLength ? minLength : StringLimits.MIN; // 0
        this._maxLength = maxLength ? maxLength : StringLimits.MAX_USUAL; // 255
    }

    public minLength(): number {
        return this._minLength;
    }

    public maxLength(): number {
        return this._maxLength;
    }    

    public lengthDiff(): number {
        return this._maxLength - this._minLength;
    }

    public medianLength(): number {
        return this._minLength + ( this.lengthDiff() / 2 );
    }    

    public hasSpaceBetweenLengths(): boolean {
        return this.lengthDiff() > 0;
    }
    
    public hasSpaceBelowMin(): boolean {
        return this._minLength > StringLimits.MIN;
    }

    public hasSpaceAboveMax(): boolean {
        return this._maxLength < StringLimits.MAX;
    }

    // DATA GENERATION

    /** @inheritDoc */
    public lowest(): string {
        return '';
    }

    /** @inheritDoc */
    public randomBelowMin(): string {
        if ( ! this.hasSpaceBelowMin() ) {
            return this.lowest();
        }        
        return this._randomString.between( StringLimits.MIN, this._minLength - 1 );
    }    

    /** @inheritDoc */
    public justBelowMin(): string {
        if ( ! this.hasSpaceBelowMin() ) {
            return this.lowest();
        }
        return this._randomString.exactly( this._minLength - 1 );
    }    

    /** @inheritDoc */
	public min(): string {
		return this._randomString.exactly( this._minLength );
	}
    
    /** @inheritDoc */
    public justAboveMin(): string {
        return this.hasSpaceBetweenLengths()
            ? this._randomString.exactly( this._minLength + 1 )
            : this.min();
    }

    /** @inheritDoc */
    public zero(): string {
        return '';
    }
    
    /** @inheritDoc */    
	public median(): string {		
		return this._randomString.exactly( this.medianLength() );
    }

    /** @inheritDoc */
    public randomBetweenMinAndMax(): string {
        return this.hasSpaceBetweenLengths()
            ? this._randomString.between( this._minLength + 1, this._maxLength - 1 )
            : this.min();
    }    

    /** @inheritDoc */
    public justBelowMax(): string {
        return this.hasSpaceBetweenLengths()
            ? this._randomString.exactly( this._maxLength - 1 )
            : this.max();
    }

    /** @inheritDoc */
	public max(): string {
		return this._randomString.exactly( this._maxLength );
    }

    /** @inheritDoc */    
    public justAboveMax(): string {
        if ( ! this.hasSpaceAboveMax() ) {
            return this.max();
        }        
        return this._randomString.exactly( this._maxLength + 1 );
    }

    /** @inheritDoc */    
    public randomAboveMax(): string {
        if ( ! this.hasSpaceAboveMax() ) {
            return this.max();
        }        
        return this._randomString.between( this._maxLength + 1, StringLimits.MAX );
    }

    /** @inheritDoc */    
    public greatest() {
        return this._randomString.exactly( StringLimits.MAX );
    }

}