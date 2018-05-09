"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CaseType_1 = require("./CaseType");
/**
 * Reduces the Variants that produce a certain State required by a Precondition
 * or by a State Call. The scenarios of these Variants will be combined with
 * the current scenario. Thus, the lesser the Variants to combine, the lower is
 * the number of produced Test Scenarios and so is will be the number of Test Cases.
 *
 * @see VariantSelectionStrategy
 */
var VariantSelectionOptions;
(function (VariantSelectionOptions) {
    VariantSelectionOptions["SINGLE_RANDOM"] = "random";
    VariantSelectionOptions["FIRST"] = "first";
    VariantSelectionOptions["FIRST_MOST_IMPORTANT"] = "fmi";
    VariantSelectionOptions["ALL"] = "all";
})(VariantSelectionOptions = exports.VariantSelectionOptions || (exports.VariantSelectionOptions = {}));
/**
 * Generic combination options
 *
 * @see CombinationStrategy
 */
var CombinationOptions;
(function (CombinationOptions) {
    CombinationOptions["SINGLE_RANDOM_OF_EACH"] = "sre";
    CombinationOptions["SHUFFLED_ONE_WISE"] = "sow";
    CombinationOptions["ONE_WISE"] = "ow";
    CombinationOptions["ALL"] = "all";
})(CombinationOptions = exports.CombinationOptions || (exports.CombinationOptions = {}));
/**
 * This is the special cases for the number of UI Elements that will receive
 * invalid DataTestCases at a time.
 *
 * The values can be indicated with a number or a string value.
 * The possible string values are defined with this enum type.
 *
 *     invalid=0 or "none"  -> elements will only receive valid values
 *
 *     invalid=1            -> one element will receive an invalid value (default)
 *     invalid=2            -> two elements will receive an invalid value
 *     ...
 *     invalid=all          -> elements will only receive invalid values
 *
 *     invalid=random       -> a random number of elements will receive invalid values (shuffled-one-wise?)
 *
 *     invalid=default      -> leave as is
 */
var InvalidSpecialOptions;
(function (InvalidSpecialOptions) {
    InvalidSpecialOptions["NONE"] = "none";
    InvalidSpecialOptions["ALL"] = "all";
    /**
     * Leave the mix untouched (i.e., does not filter the DataTestCases of each UI Element ) and
     * apply SHUFFLED_ONE_WISE combination for the DataTestCases.
     *
     * !!! THIS OPTION CHANGES THE COMBINATION OF DataTestCases THAT WAS CHOSEN BY THE USER !!!
     */
    InvalidSpecialOptions["RANDOM"] = "random";
    /**
     * Leave the mix untouched (i.e., does not filter the DataTestCases of each UI Element ).
     */
    InvalidSpecialOptions["DEFAULT"] = "smart";
})(InvalidSpecialOptions = exports.InvalidSpecialOptions || (exports.InvalidSpecialOptions = {}));
/**
 * Default values
 */
class Defaults {
    constructor() {
        this.LANGUAGE = 'en';
        this.ENCODING = 'utf8';
        this.EXTENSION_FEATURE = '.feature'; // Extension for feature files
        this.EXTENSION_TEST_CASE = '.testcase'; // Extension for test case files
        this.EXTENSIONS = [this.EXTENSION_FEATURE, this.EXTENSION_TEST_CASE];
        this.CFG_FILE_NAME = '.concordiarc'; // Name for configuration files
        this.DIR_PLUGIN = 'plugins/';
        this.DIR_LANGUAGE = 'data/';
        this.DIR_TEST_CASE = null; // null means "same as the feature file"
        this.DIR_SCRIPT = 'test/';
        this.DIR_SCRIPT_RESULT = 'test/';
        // CONTENT GENERATION
        this.CASE_UI = CaseType_1.CaseType.CAMEL.toString(); // e.g., fullName
        this.CASE_METHOD = CaseType_1.CaseType.SNAKE.toString(); // e.g., my_test_method
        this.TC_INDENTER = '  '; // test case indenter
        // RANDOMIC GENERATION
        this.RANDOM_MIN_STRING_SIZE = 0;
        this.RANDOM_MAX_STRING_SIZE = 500;
        this.RANDOM_TRIES_TO_INVALID_VALUE = 5; // How many tries it will make to generate random values that are not in a set
        this.IMPORTANCE = 5; // 0..9
        this.LINE_BREAKER = "\n";
        // TEST SCENARIO SELECTION AND COMBINATION STRATEGIES
        /** @see VariantSelectionOptions */
        this.VARIANT_SELECTION = VariantSelectionOptions.SINGLE_RANDOM.toString();
        /** @see StateCombinationOptions */
        this.STATE_COMBINATION = CombinationOptions.SINGLE_RANDOM_OF_EACH.toString();
        // SELECTION AND COMBINATION STRATEGIES FOR DATA TEST CASES
        /**
         * How many UI Elements will receive invalid values at a time.
         *
         *     invalid=0 or "none"  -> elements will only receive valid values
         *
         *     invalid=1            -> one element will receive an invalid value (default)
         *     invalid=2            -> two elements will receive an invalid value
         *     ...
         *     invalid=all          -> elements will only receive invalid values
         *
         *     invalid=random       -> a random number of elements will receive invalid values (shuffled-one-wise?)
         *
         * @see InvalidSpecialOptions
         */
        this.INVALID_DATA_TEST_CASES_AT_A_TIME = InvalidSpecialOptions.DEFAULT;
        /** @see DataTestCaseCombinationOptions */
        this.DATA_TEST_CASE_COMBINATION = CombinationOptions.SHUFFLED_ONE_WISE.toString();
    }
    // UTILITIES
    /**
     * Returns available encodings.
     *
     * @see https://github.com/nodejs/node/blob/master/lib/buffer.js
     */
    availableEncodings() {
        return [
            'utf8', 'utf-8',
            'ascii',
            'latin1',
            'ucs2', 'ucs-2',
            'utf16le', 'utf-16le'
        ];
    }
}
exports.Defaults = Defaults;
//# sourceMappingURL=Defaults.js.map