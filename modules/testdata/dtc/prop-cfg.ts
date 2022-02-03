import { LocalDate, LocalDateTime, LocalTime } from '@js-joda/core';

import { ValueType } from '../../util/ValueTypeDetector';
import { AnyValue } from './AnyValue';

interface HasValue< T > {
	/** Property value */
	value: T;
}

interface MayHaveInvertedLogic {

	/**
	 * Indicates if the property uses an inverted logic to get the value.
	 * 👉 Currently used only for the property VALUE.
	 *
	 * Example:
	 * 	- value is not in [1, 2, 3]
	 *
	 * Since the sentences has `not`, the logic for its value generation is inverted.
	 * That is, any generated value that is not in the set is considered value.
	 */
	invertedLogic?: boolean;
}

interface MayHaveOnlyValidDTC {

	/**
	 * Indicates if the property should generate only VALID Data Test Cases.
	 * This is usually `true` when the annotation @OnlyValidDTC is used in the property.
	 */
	onlyValidDTC?: boolean;
}

type LimitValue = number | LocalDate | LocalTime | LocalDateTime;

/**
 * UI Element Property configuration, used for Data Test Case generation.
 */
export interface PropCfg {

	id?: HasValue< string >;

	type?: HasValue< string >;

	editable?: HasValue< boolean >;

	datatype?: HasValue< ValueType >;

	required?: HasValue< boolean > & MayHaveOnlyValidDTC;

	value?: HasValue< AnyValue > & MayHaveOnlyValidDTC & MayHaveInvertedLogic;

	format?: HasValue< string > & MayHaveOnlyValidDTC & MayHaveInvertedLogic;

	minlength?: HasValue< number > & MayHaveOnlyValidDTC;

	maxlength?: HasValue< number > & MayHaveOnlyValidDTC;

	minvalue?: HasValue< LimitValue > & MayHaveOnlyValidDTC;

	maxvalue?: HasValue< LimitValue > & MayHaveOnlyValidDTC;

	locale?: HasValue< string >;

	localeFormat?: HasValue< string >;

}


type UIEName = string;
export type UIEPropertyCache = Map< UIEName, PropCfg >;



/**
 * Returns `true` if there are values between the given values.
 *
 * @param value1 Value 1
 * @param value2 Value 2
 * @returns
 */
export function hasFreeValuesBetweenThem( value1?: LimitValue, value2?: LimitValue ): boolean {

	if ( value1 === undefined || value2 === undefined ) {
		return false;
	}

	if ( typeof value1 === 'number' || typeof value2 === 'number' ) {
		return value1.toString() != value2.toString(); // Both integer and float
	}

	return ! value1.equals( value2 );
}
