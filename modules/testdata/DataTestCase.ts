/**
 * Data test cases.
 *
 * @author Thiago Delgado Pinto
 */
export enum DataTestCase {

	// value
	VALUE_LOWEST = 'VALUE_LOWEST',
	VALUE_RANDOM_BELOW_MIN = 'VALUE_RANDOM_BELOW_MIN',
	VALUE_JUST_BELOW_MIN = 'VALUE_JUST_BELOW_MIN',
	VALUE_MIN = 'VALUE_MIN',
	VALUE_JUST_ABOVE_MIN = 'VALUE_JUST_ABOVE_MIN',
	VALUE_ZERO = 'VALUE_ZERO',
	VALUE_MEDIAN = 'VALUE_MEDIAN',
	VALUE_RANDOM_BETWEEN_MIN_MAX = 'VALUE_RANDOM_BETWEEN_MIN_MAX',
	VALUE_JUST_BELOW_MAX = 'VALUE_JUST_BELOW_MAX',
	VALUE_MAX = 'VALUE_MAX',
	VALUE_JUST_ABOVE_MAX = 'VALUE_JUST_ABOVE_MAX',
	VALUE_RANDOM_ABOVE_MAX = 'VALUE_RANDOM_ABOVE_MAX',
	VALUE_GREATEST = 'VALUE_GREATEST',

	// length
	LENGTH_LOWEST = 'LENGTH_LOWEST', // zero/empty
	LENGTH_RANDOM_BELOW_MIN = 'LENGTH_RANDOM_BELOW_MIN',
	LENGTH_JUST_BELOW_MIN = 'LENGTH_JUST_BELOW_MIN',
	LENGTH_MIN = 'LENGTH_MIN',
	LENGTH_JUST_ABOVE_MIN = 'LENGTH_JUST_ABOVE_MIN',
	LENGTH_MEDIAN = 'LENGTH_MEDIAN',
	LENGTH_RANDOM_BETWEEN_MIN_MAX = 'LENGTH_RANDOM_BETWEEN_MIN_MAX',
	LENGTH_JUST_BELOW_MAX = 'LENGTH_JUST_BELOW_MAX',
	LENGTH_MAX = 'LENGTH_MAX',
	LENGTH_JUST_ABOVE_MAX = 'LENGTH_JUST_ABOVE_MAX',
	LENGTH_RANDOM_ABOVE_MAX = 'LENGTH_RANDOM_ABOVE_MAX',
	LENGTH_GREATEST = 'LENGTH_GREATEST',

	// format
	FORMAT_VALID = 'FORMAT_VALID',
	FORMAT_INVALID = 'FORMAT_INVALID',

	// set
	SET_FIRST_ELEMENT = 'SET_FIRST_ELEMENT',
	SET_RANDOM_ELEMENT = 'SET_RANDOM_ELEMENT',
	SET_LAST_ELEMENT = 'SET_LAST_ELEMENT',
	SET_NOT_IN_SET = 'SET_NOT_IN_SET',

	// required
	REQUIRED_FILLED = 'REQUIRED_FILLED',
	REQUIRED_NOT_FILLED = 'REQUIRED_NOT_FILLED',

	// computation
	COMPUTATION_RIGHT = 'COMPUTATION_RIGHT',
	COMPUTATION_WRONG = 'COMPUTATION_WRONG'

}

/**
 * Data test case group.
 *
 * @author Thiago Delgado Pinto
 */
export enum DataTestCaseGroup {
	VALUE,
	LENGTH,
	FORMAT,
	SET,
	REQUIRED,
	COMPUTATION
}

/**
 * Data test cases of each group.
 *
 * @author Thiago Delgado Pinto
 */
export class DataTestCaseGroupDef {

	readonly value: DataTestCase[] = [
		DataTestCase.VALUE_LOWEST,
		DataTestCase.VALUE_RANDOM_BELOW_MIN,
		DataTestCase.VALUE_JUST_BELOW_MIN,
		DataTestCase.VALUE_MIN,
		DataTestCase.VALUE_JUST_ABOVE_MIN,
		DataTestCase.VALUE_ZERO,
		DataTestCase.VALUE_MEDIAN,
		DataTestCase.VALUE_RANDOM_BETWEEN_MIN_MAX,
		DataTestCase.VALUE_JUST_BELOW_MAX,
		DataTestCase.VALUE_MAX,
		DataTestCase.VALUE_JUST_ABOVE_MAX,
		DataTestCase.VALUE_RANDOM_ABOVE_MAX,
		DataTestCase.VALUE_GREATEST
	];

	readonly length: DataTestCase[] = [
		DataTestCase.LENGTH_LOWEST,
		DataTestCase.LENGTH_RANDOM_BELOW_MIN,
		DataTestCase.LENGTH_JUST_BELOW_MIN,
		DataTestCase.LENGTH_MIN,
		DataTestCase.LENGTH_JUST_ABOVE_MIN,
		DataTestCase.LENGTH_MEDIAN,
		DataTestCase.LENGTH_RANDOM_BETWEEN_MIN_MAX,
		DataTestCase.LENGTH_JUST_BELOW_MAX,
		DataTestCase.LENGTH_MAX,
		DataTestCase.LENGTH_JUST_ABOVE_MAX,
		DataTestCase.LENGTH_RANDOM_ABOVE_MAX,
		DataTestCase.LENGTH_GREATEST
	];

	readonly format: DataTestCase[] = [
		DataTestCase.FORMAT_VALID,
		DataTestCase.FORMAT_INVALID
	];

	readonly set: DataTestCase[] = [
		DataTestCase.SET_FIRST_ELEMENT,
		DataTestCase.SET_RANDOM_ELEMENT,
		DataTestCase.SET_LAST_ELEMENT,
		DataTestCase.SET_NOT_IN_SET
	];

	readonly required: DataTestCase[] = [
		DataTestCase.REQUIRED_FILLED,
		DataTestCase.REQUIRED_NOT_FILLED
	];

	readonly computation: DataTestCase[] = [
		DataTestCase.COMPUTATION_RIGHT,
		DataTestCase.COMPUTATION_WRONG
	];

	/**
	 * Returns the test cases of the given group.
	 *
	 * @param group Test case group.
	 */
	ofGroup( group: DataTestCaseGroup ): DataTestCase[] {
		switch ( group ) {
			case DataTestCaseGroup.VALUE: return this.value;
			case DataTestCaseGroup.LENGTH: return this.length;
			case DataTestCaseGroup.FORMAT: return this.format;
			case DataTestCaseGroup.SET: return this.set;
			case DataTestCaseGroup.REQUIRED: return this.required;
			case DataTestCaseGroup.COMPUTATION: return this.computation;
			default: throw new Error( 'Unexpected group' );
		}
    }

	/**
	 * Returns the group of the given test case.
	 *
	 * @param testCase Test case
	 */
    groupOf( testCase: DataTestCase ): DataTestCaseGroup {
        if ( this.value.indexOf( testCase ) >= 0 ) return DataTestCaseGroup.VALUE;
        if ( this.length.indexOf( testCase ) >= 0 ) return DataTestCaseGroup.LENGTH;
        if ( this.format.indexOf( testCase ) >= 0 ) return DataTestCaseGroup.FORMAT;
        if ( this.set.indexOf( testCase ) >= 0 ) return DataTestCaseGroup.SET;
        if ( this.required.indexOf( testCase ) >= 0 ) return DataTestCaseGroup.REQUIRED;
        if ( this.computation.indexOf( testCase ) >= 0 ) return DataTestCaseGroup.COMPUTATION;
        throw new Error( 'Test case not found in any available group' );
    }

}