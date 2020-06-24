"use strict";
// A Variant produces many Test Scenarios.
// Test Scenarios have successful and failing scenarios.
// Successful scenarios are chosen to be combined in preconditions or state calls.
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTestCase = void 0;
// A DataTestCase can be classified as Valid, Invalid or Incompatible, according
// to the configuration of its corresponding UI ELement.
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
var DataTestCase;
(function (DataTestCase) {
    /**
     * When it does not have any properties. It respects the data type.
     */
    DataTestCase[DataTestCase["RANDOM_VALUE"] = 0] = "RANDOM_VALUE";
    // Value
    /**
     * Equal to a fixed or retrieved value or set with a single element.
     *
     * When the property "value" is fixed and has a single value,
     * the generated value should be equal to it.
     *
     * OR
     *
     * When the property "value" depends on the value of another UI Element,
     * and the retrieved value is unique (single), the generated value
     * should be equal to the retrieved value.
     */
    DataTestCase[DataTestCase["EQUAL_TO_VALUE"] = 1] = "EQUAL_TO_VALUE";
    /**
     * When the property "value" is fixed and has a single value,
     * the generated value should be different from it.
     */
    DataTestCase[DataTestCase["RANDOM_DIFFERENT_FROM_VALUE"] = 2] = "RANDOM_DIFFERENT_FROM_VALUE";
    // Set
    DataTestCase[DataTestCase["RANDOM_IN_SET"] = 3] = "RANDOM_IN_SET";
    /**
     * When the property "value" depends on the value of another UI Element,
     * the generated value should be different from the retrieved value.
     */
    DataTestCase[DataTestCase["RANDOM_NOT_IN_SET"] = 4] = "RANDOM_NOT_IN_SET";
    // Number
    DataTestCase[DataTestCase["ZERO"] = 5] = "ZERO";
    // String
    DataTestCase[DataTestCase["EMPTY"] = 6] = "EMPTY";
    DataTestCase[DataTestCase["GREATEST_LENGTH"] = 7] = "GREATEST_LENGTH";
    // Minimum length
    DataTestCase[DataTestCase["RANDOM_BELOW_MINIMUM_LENGTH"] = 8] = "RANDOM_BELOW_MINIMUM_LENGTH";
    DataTestCase[DataTestCase["JUST_BELOW_MINIMUM_LENGTH"] = 9] = "JUST_BELOW_MINIMUM_LENGTH";
    DataTestCase[DataTestCase["EQUAL_TO_MINIMUM_LENGTH"] = 10] = "EQUAL_TO_MINIMUM_LENGTH";
    DataTestCase[DataTestCase["JUST_ABOVE_MINIMUM_LENGTH"] = 11] = "JUST_ABOVE_MINIMUM_LENGTH";
    DataTestCase[DataTestCase["RANDOM_ABOVE_MINIMUM_LENGTH"] = 12] = "RANDOM_ABOVE_MINIMUM_LENGTH";
    // Maximum length
    DataTestCase[DataTestCase["RANDOM_BELOW_MAXIMUM_LENGTH"] = 13] = "RANDOM_BELOW_MAXIMUM_LENGTH";
    DataTestCase[DataTestCase["JUST_BELOW_MAXIMUM_LENGTH"] = 14] = "JUST_BELOW_MAXIMUM_LENGTH";
    DataTestCase[DataTestCase["EQUAL_TO_MAXIMUM_LENGTH"] = 15] = "EQUAL_TO_MAXIMUM_LENGTH";
    DataTestCase[DataTestCase["JUST_ABOVE_MAXIMUM_LENGTH"] = 16] = "JUST_ABOVE_MAXIMUM_LENGTH";
    DataTestCase[DataTestCase["RANDOM_ABOVE_MAXIMUM_LENGTH"] = 17] = "RANDOM_ABOVE_MAXIMUM_LENGTH";
    // Minimum length & Maximum length
    DataTestCase[DataTestCase["RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_LENGTH"] = 18] = "RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_LENGTH";
    // Minimum value
    DataTestCase[DataTestCase["LOWEST_VALUE"] = 19] = "LOWEST_VALUE";
    DataTestCase[DataTestCase["RANDOM_BELOW_MINIMUM_VALUE"] = 20] = "RANDOM_BELOW_MINIMUM_VALUE";
    DataTestCase[DataTestCase["JUST_BELOW_MINIMUM_VALUE"] = 21] = "JUST_BELOW_MINIMUM_VALUE";
    DataTestCase[DataTestCase["EQUAL_TO_MINIMUM_VALUE"] = 22] = "EQUAL_TO_MINIMUM_VALUE";
    DataTestCase[DataTestCase["JUST_ABOVE_MINIMUM_VALUE"] = 23] = "JUST_ABOVE_MINIMUM_VALUE";
    // Maximum value
    DataTestCase[DataTestCase["JUST_BELOW_MAXIMUM_VALUE"] = 24] = "JUST_BELOW_MAXIMUM_VALUE";
    DataTestCase[DataTestCase["EQUAL_TO_MAXIMUM_VALUE"] = 25] = "EQUAL_TO_MAXIMUM_VALUE";
    DataTestCase[DataTestCase["JUST_ABOVE_MAXIMUM_VALUE"] = 26] = "JUST_ABOVE_MAXIMUM_VALUE";
    DataTestCase[DataTestCase["RANDOM_ABOVE_MAXIMUM_VALUE"] = 27] = "RANDOM_ABOVE_MAXIMUM_VALUE";
    DataTestCase[DataTestCase["GREATEST_VALUE"] = 28] = "GREATEST_VALUE";
    // Minimum value & Maximum value
    DataTestCase[DataTestCase["RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_VALUE"] = 29] = "RANDOM_BETWEEN_MINIMUM_AND_MAXIMUM_VALUE";
    DataTestCase[DataTestCase["MEDIAN_VALUE"] = 30] = "MEDIAN_VALUE";
    // Format
    DataTestCase[DataTestCase["RANDOM_FROM_FORMAT"] = 31] = "RANDOM_FROM_FORMAT";
    DataTestCase[DataTestCase["RANDOM_DIFFERENT_FROM_FORMAT"] = 32] = "RANDOM_DIFFERENT_FROM_FORMAT";
})(DataTestCase = exports.DataTestCase || (exports.DataTestCase = {}));
