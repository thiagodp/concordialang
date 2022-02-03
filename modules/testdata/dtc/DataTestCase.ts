// A Variant produces many Test Scenarios.
// Test Scenarios have successful and failing scenarios.
// Successful scenarios are chosen to be combined in preconditions or state calls.
//

// A DataTestCase can be classified as Valid, Invalid or Incompatible, according
// to the configuration of its corresponding UI Element.
//
// An Incompatible DataTestCase is not used.
//
// A DataTestCase impacts others that depend on it:
//   - When value depends on other UI Element property:
//
//	   1) It should always assume EQUAL_TO_RETRIEVED for Valid Values.
//	      For instance, when Password has a rule that make its value comes from
//	      Username, and Username is Valid, it should only assume
//	      EQUAL_TO_RETRIEVED as a Valid value.
//
//     2) It can assume anything different from the value retrieved from the
//		  set, but it should also respect other existing rules.
//

/**
 * DataTestCase
 *
 * Evaluation priority:
 *
 *   1. required
 *   2. value
 *   3. format
 *   4. minimum/maximum length
 *   5. minimum/maximum value
 *
 */
export enum DataTestCase {

	/**
	 * When it does not have any properties. It respects the data type.
	 */
	RANDOM_VALUE,

	// Value

	/**
	 * Equal to a fixed or retrieved value or maybe a set with a single element.
	 *
	 * Valid values:
	 * - Whether the property "value" is a fixed, single value, then it should also be the generated value.
	 * - Whether the property "value" depends on the value of another UI Element and the retrieved value is
	 *   a fixed, single value, the generated value should be equal to the retrieved value.
	 */
	EQUAL_TO_VALUE,

	/**
	 * When the property "value" is fixed and has a single value,
	 * the generated value should be different from it.
	 */
	RANDOM_DIFFERENT_FROM_VALUE,

	// Set

	RANDOM_IN_SET, // same as old SET_RANDOM_ELEMENT

	/**
	 * When the property "value" depends on the value of another UI Element,
	 * the generated value should be different from the retrieved value.
	 */
	RANDOM_NOT_IN_SET, // same as old SET_NOT_IN_SET

	// Number

	ZERO,

	// String

	EMPTY,
	GREATEST_LENGTH, // Really needed ???

	// Minimum length

	RANDOM_BELOW_MINIMUM_LENGTH,
	JUST_BELOW_MINIMUM_LENGTH,
	EQUAL_TO_MINIMUM_LENGTH,
	JUST_ABOVE_MINIMUM_LENGTH,
	RANDOM_ABOVE_MINIMUM_LENGTH,

	// Maximum length

	RANDOM_BELOW_MAXIMUM_LENGTH,
	JUST_BELOW_MAXIMUM_LENGTH,
	EQUAL_TO_MAXIMUM_LENGTH,
	JUST_ABOVE_MAXIMUM_LENGTH,
	RANDOM_ABOVE_MAXIMUM_LENGTH,

	// Minimum length & Maximum length

	RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_LENGTH,

	// Minimum value

	LOWEST_VALUE,
	RANDOM_BELOW_MINIMUM_VALUE,
	JUST_BELOW_MINIMUM_VALUE,
	EQUAL_TO_MINIMUM_VALUE,
	JUST_ABOVE_MINIMUM_VALUE,

	// Maximum value

	JUST_BELOW_MAXIMUM_VALUE,
	EQUAL_TO_MAXIMUM_VALUE,
	JUST_ABOVE_MAXIMUM_VALUE,
	RANDOM_ABOVE_MAXIMUM_VALUE,
	GREATEST_VALUE,

	// Minimum value & Maximum value

	RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_VALUE,
	MEDIAN_VALUE,

	// Format

	RANDOM_FROM_FORMAT,
	RANDOM_DIFFERENT_FROM_FORMAT,

}
