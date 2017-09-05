import { DoubleLimits } from '../limits/DoubleLimits';

/**
 * Generates random double values.
 */
export class RandomDouble {

	/**
	 * Generates a random number between a minimum and a maximum value, both
	 * inclusive.
	 * 
	 * @param min	The minimum value (inclusive).
	 * @param max	The maximum value (inclusive).
	 * @return		A number between the minimum and the maximum.
	 */
	public between( min: number, max: number ): number {
        let num = Math.random();  // 0d <= number < 1d
        return min + ( num * ( max - min ) );
	}
	
	/**
	 * Generates a random value before a maximum value.
	 * 
	 * @param max	The maximum value.
	 * @return		A random value before the maximum value.
	 */
	public before( value: number, delta: number ): number {
		return this.between( DoubleLimits.MIN, value - delta );
	}

	/**
	 * Generates a random value after a minimum value.
	 * 
	 * @param min	The minimum value.
	 * @return		A random value after the minimum value.
	 */
	public after( value: number, delta: number ): number {
		return this.between( value + delta, DoubleLimits.MAX );
	}	

}
