import { LongLimits } from "../limits/LongLimits";
import { Random } from "./Random";

/**
 * Generates random long integer values.
 *
 * @author Thiago Delgado Pinto
 */
export class RandomLong {

	constructor( private _random: Random ) {
	}

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
        return Math.floor( this._random.generate() * ( max - min + 1 ) ) + min;
	}

	/**
	 * Generates a random value less than a maximum value.
	 *
	 * @param max	The maximum value.
	 * @return		A random value less than a maximum value.
	 */
	public before( max: number ): number {
		return this.between( LongLimits.MIN, max - 1 );
	}

	/**
	 * Generates a random value greater than a minimum value.
	 *
	 * @param min	The minimum value.
	 * @return		A random value greater than a minimum value.
	 */
	public after( min: number ): number {
		return this.between( min + 1, LongLimits.MAX );
	}

}