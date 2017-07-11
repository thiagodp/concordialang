import { Limits } from './Limits';

/**
 * Long random value generator.
 */
export class LongRandom {

	/**
	 * Generates a random number between a minimum and a maximum value, both
	 * inclusive.
	 * 
	 * @param min	The minimum value (inclusive).
	 * @param max	The maximum value (inclusive).
	 * @return		A number between the minimum and the maximum.
	 */
	public between( min: number, max: number ): number {
        min = Math.ceil( min );
        max = Math.floor( max );
        return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
	}

	/**
	 * Generates a random value lesser than a maximum value.
	 * 
	 * @param max	The maximum value.
	 * @return		A random value lesser than a maximum value.
	 */
	public before( max: number ): number {
		return this.between( Limits.MIN_INT, max - 1 );
	}

	/**
	 * Generates a random value greater than a minimum value.
	 * 
	 * @param min	The minimum value.
	 * @return		A random value greater than a minimum value.
	 */	
	public after( min: number ): number {
		return this.between( min + 1, Limits.MAX_INT );
	}    
    
}