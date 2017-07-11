import { ValueGenerator } from './ValueGenerator';
import { ValidValueOption } from './ValidValueOption';
import { InvalidValueOption } from './InvalidValueOption';

/**
 * Default value generator.
 */
export abstract class DefaultValueGenerator< T > implements ValueGenerator< T >  {

    /**
     * @inheritDoc
     */
    abstract hasAvailableValuesOutOfTheRange(): boolean;

    /**
     * @inheritDoc
     */
	public validValue( option: ValidValueOption ): T {
		if ( ValidValueOption.ZERO == option ) {			
			return this.zero();
		} else if ( ValidValueOption.MIN == option ) {
			return this.min();
		} else if ( ValidValueOption.MAX == option ) {
			return this.max();
		} else if ( ValidValueOption.MEDIAN == option ) {
			return this.hasAnyValueBetween( this.min(), this.max() ) ? this.middle() : this.min(); 
		} else if ( ValidValueOption.RIGHT_AFTER_MIN == option ) {			
			return this.hasNext( this.min() ) ? this.next( this.min() ) : this.min();
		} else if ( ValidValueOption.RIGHT_BEFORE_MAX == option ) {
			return this.hasPrior( this.max() ) ? this.prior( this.max() ) : this.max();
		} else if ( ValidValueOption.RANDOM_INSIDE_RANGE == option ) {
			return this.hasAnyValueBetween( this.min(), this.max() )
                ? this.randomBetween( this.min(), this.max() )
                : this.min();
		}
		return null;
	}

    /**
     * @inheritDoc
     */
	public invalidValue( option: InvalidValueOption ): T {
		if ( ! this.hasAvailableValuesOutOfTheRange() ) {
			return null;
		}
		if ( InvalidValueOption.RIGHT_BEFORE_MIN == option ) {
			return this.prior( this.min() );
		} else if ( InvalidValueOption.RIGHT_AFTER_MAX == option ) {
			return this.next( this.max() );
		} else if ( InvalidValueOption.RANDOM_BEFORE_MIN == option ) {
			return this.randomBefore( this.min() );
		} else if ( InvalidValueOption.RANDOM_AFTER_MAX == option ) {
			return this.randomAfter( this.max() );
		}
		return null;
	}	
	
	/**
	 * Returns the minimum value.
	 * @return
	 */
	public abstract min(): T;
	
	/**
	 * Returns the maximum value.
	 * @return
	 */	
	public abstract max(): T;

	/**
	 * Returns the zero value, or the minimum as zero if it is not available.
	 * @return
	 */
	protected abstract zero(): T;
	
	/**
	 * Returns the middle value.
	 * @return
	 */
	protected abstract middle(): T;
	
	/**
	 * Returns true if a value is before the maximum.
	 * 
	 * @param value	the value to be verified.
	 * @return
	 */
	protected abstract hasNext( value: T ): boolean;
	
	/**
	 * Returns a value after the supplied value.
	 * 
	 * @param value	the current value.
	 * @return
	 */
	protected abstract next( value: T ): T;
	
	/**
	 * Returns true if a value is after the minimum.
	 * 
	 * @param value	the value to be verified.
	 * @return
	 */	
	protected abstract hasPrior( value: T ): boolean;
	
	/**
	 * Returns a value before the supplied value.
	 * 
	 * @param value
	 * @return
	 */	
	protected abstract prior( value: T ): T;
	
	/**
	 * Returns a random value before the supplied value.
	 * 
	 * @param value
	 * @return
	 */
	protected abstract randomBefore( value: T ): T;
	
	/**
	 * Returns a random value after the supplied value.
	 * 
	 * @param value
	 * @return
	 */	
	protected abstract randomAfter( value: T ): T;
	
	/**
	 * Returns true if there is a value between a minimum and a maximum value.
	 *  
	 * @param min	the minimum value.
	 * @param max	the maximum value.
	 * @return
	 */
	protected abstract hasAnyValueBetween( min: T, max: T ): boolean;
	
	/**
	 * Returns a value between a minimum and a maximum value.
	 * 
	 * @param min	the minimum value.
	 * @param max	the maximum value.
	 * @return
	 */
	protected abstract randomBetween( min: T, max: T ): T;    

}