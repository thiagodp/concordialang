import { isDefined } from '../../util/TypeChecking';
/**
 * Checks minimum and maximum values.
 * 
 * @author Thiago Delgado Pinto
 */
export class MinMaxChecker {

	/**
	 * Check the given values, throwing an exception whether one of them is invalid.
	 * 
	 * @param min
	 * @param max 
	 * @param delta 
     * 
     * @throws Error
	 */
	public check(
		min?: number | string,
		max?: number | string,
		delta?: number
	): void {
		// min
		if ( isDefined( min ) && isNaN( min as any ) ) {
			throw new Error( "min is NaN." );
		}
		// max
		if ( isDefined( max ) && isNaN( max as any ) ) {
			throw new Error( "max is NaN." );
        }
        // min > max
        if ( isDefined( min ) && isDefined( max ) && Number( min ) > Number( max ) ) {
            throw new Error( "min can't be greater than max." );
        }
		// delta
		if ( isDefined( delta ) && delta < 0 ) {
			throw new Error( "delta can't be negative." );
		}
	}


	/**
	 * Return the greatest fractional part, according to the precision of 
	 * minimum and maximum values.
	 * 
	 * These values are given as *strings* because JavaScript ignores zeros 
	 * as decimal places when converting a string to a number (e.g.,
	 * '1.0' becomes 1 instead of 1.0).
	 * 
	 * Examples:
	 *    min = 2,    max = 10     -> 1
	 *    min = 2.0,  max = 10     -> 0.1
	 *    min = 2.00, max = 10     -> 0.01
	 *    min = 2.00, max = 10.000 -> 0.001
	 * 
	 * @param defaultDelta Delta to be used when both min and max are undefined.
	 * @param min The minimum value as string.
	 * @param max The maximum value as string.
	 */
	public greatestFractionalPart( defaultDelta: number, min?: string, max?: string ): number {
		const minFracLength: number = this.fractionalPartLength( min );
		const maxFracLength: number = this.fractionalPartLength( max );
		let greatestLength: number = maxFracLength > minFracLength ? maxFracLength : minFracLength;
		if ( greatestLength < 1 ) {
			greatestLength = 1;
		}
		return 1 / Math.pow( 10, greatestLength );
	}

	/**
	 * Returns the length of the fractional part of a number.
	 * E.g., "10.25" has ".25" as its fractional part and "25" has length 2.
	 * 
	 * @param num Number
	 */
	public fractionalPartLength( num: string ): number {
		if ( ! isDefined( num ) || '' === num ) return 0;
		const numStr = num.toString(); // Just to guarantee the right type in the conversion to JS
		const idx = numStr.lastIndexOf( '.' );
		if ( idx < 0 ) return 0;
		return numStr.substring( idx + 1 ).length;
	}

}