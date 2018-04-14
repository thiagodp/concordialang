export interface DataTestCaseNames {

	// value
	VALUE_LOWEST: string;
	VALUE_RANDOM_BELOW_MIN: string;
	VALUE_JUST_BELOW_MIN: string;
	VALUE_MIN: string;
	VALUE_JUST_ABOVE_MIN: string;
	VALUE_ZERO: string;
	VALUE_MEDIAN: string;
	VALUE_RANDOM_BETWEEN_MIN_MAX: string;
	VALUE_JUST_BELOW_MAX: string;
	VALUE_MAX: string;
	VALUE_JUST_ABOVE_MAX: string;
	VALUE_RANDOM_ABOVE_MAX: string;
	VALUE_GREATEST: string;

	// length
	LENGTH_LOWEST: string; // zero/empty
	LENGTH_RANDOM_BELOW_MIN: string;
	LENGTH_JUST_BELOW_MIN: string;
	LENGTH_MIN: string;
	LENGTH_JUST_ABOVE_MIN: string;
	LENGTH_MEDIAN: string;
	LENGTH_RANDOM_BETWEEN_MIN_MAX: string;
	LENGTH_JUST_BELOW_MAX: string;
	LENGTH_MAX: string;
	LENGTH_JUST_ABOVE_MAX: string;
	LENGTH_RANDOM_ABOVE_MAX: string;
	LENGTH_GREATEST: string;

	// format
	FORMAT_VALID: string;
	FORMAT_INVALID: string;

	// set
	SET_FIRST_ELEMENT: string;
	// SET_SECOND_ELEMENT: string;
	SET_RANDOM_ELEMENT: string;
	// SET_PENULTIMATE_ELEMENT: string;
	SET_LAST_ELEMENT: string;
	SET_NOT_IN_SET: string;

	// required
	REQUIRED_FILLED: string;
	REQUIRED_NOT_FILLED: string;

	// computation
	COMPUTATION_RIGHT: string;
	COMPUTATION_WRONG: string;
}