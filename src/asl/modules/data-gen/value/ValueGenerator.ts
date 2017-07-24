import { ValidValueOption } from './ValidValueOption';
import { InvalidValueOption } from './InvalidValueOption';

/**
 * Value generator
 */
export interface ValueGenerator< T > {

	/**
	 * Analyzes whether there are available values out of the range. This can be
	 * used to determine if the value configuration is able to generate invalid
	 * values.
	 */
	hasAvailableValuesOutOfTheRange(): boolean;

	/**
	 * Generates a valid value according to the desired option.
	 * 
	 * @param option	The desired option.
	 * @return			A valid value.
	 */
	validValue( option: ValidValueOption ): T;

	/**
	 * Generates a invalid value according to the desired option.
	 * 
	 * @param option	The desired option.
	 * @return			A invalid value.
	 */
	invalidValue( option: InvalidValueOption): T;

}