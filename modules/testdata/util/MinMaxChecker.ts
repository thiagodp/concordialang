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
		if ( min !== undefined && isNaN( min as any ) ) {
			throw new Error( "min is NaN." );
		}
		// max
		if ( max !== undefined && isNaN( max as any ) ) {
			throw new Error( "max is NaN." );
        }
        // min > max
        if ( min && max && Number( min ) > Number( max ) ) {
            throw new Error( "min can't be greater than max." );
        }
		// delta
		if ( delta && delta < 0 ) {
			throw new Error( "delta can't be negative." );
		}
	}


	/**
	 * Return the greatest fractional part, according to the precision of
	 * minimum and maximum values. These values are given as strings because
	 * JavaScript ignores zeros as decimal places when converting a string
	 * to a number (e.g. '1.0' becomes 1 instead of 1.0).
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
		/*
		if ( undefined === min && undefined === max ) { // both are undefined
			return defaultDelta;
		}
		let minStr: string = ( min !== undefined ) ? min.toString() : "";
		let maxStr: string = ( max !== undefined ) ? max.toString() : "";
		let restStr: string = minStr.length > maxStr.length ? minStr : maxStr;
		let restLen: number = restStr.length - "0.".length;
		let frac: number = 1 / Math.pow( 10, restLen );
		return frac;
		*/

		if ( ! min && ! max ) {
			return defaultDelta;
		}

		const minIdx: number = min.lastIndexOf( '.' );
		const maxIdx: number = max.lastIndexOf( '.' );
		if ( minIdx < 0 && maxIdx < 0 ) { // both are integers
			return 1; // difference between two integers
		}

		const minFrac: string = minIdx >= 0 ? min.substring( minIdx + 1 ) : '';
		const maxFrac: string = maxIdx >= 0 ? max.substring( maxIdx + 1 ) : '';

		let greatestLength: number = minFrac.length > maxFrac.length ? minFrac.length : maxFrac.length;
		if ( 0 === greatestLength ) { // sanity
			greatestLength = 1;
		}

		return 1 / Math.pow( 10, greatestLength );
	}	

}