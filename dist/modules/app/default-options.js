"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.availableEncodings = exports.DEFAULT_DATA_TEST_CASE_COMBINATION = exports.DEFAULT_INVALID_DATA_TEST_CASES_AT_A_TIME = exports.DEFAULT_STATE_COMBINATION = exports.DEFAULT_VARIANT_SELECTION = exports.DEFAULT_IMPORTANCE = exports.DEFAULT_RANDOM_TRIES_TO_INVALID_VALUE = exports.DEFAULT_RANDOM_MAX_STRING_SIZE = exports.DEFAULT_RANDOM_MIN_STRING_SIZE = exports.DEFAULT_TC_INDENTER = exports.DEFAULT_CASE_METHOD = exports.DEFAULT_CASE_UI = exports.DEFAULT_LINE_BREAKER = exports.DEFAULT_ENCODING = exports.DEFAULT_LANGUAGE = exports.DEFAULT_EXTENSION_TEST_CASE = exports.DEFAULT_EXTENSION_FEATURE = exports.DEFAULT_AST_FILE = exports.DEFAULT_CONFIG = exports.DEFAULT_DIR_RESULT = exports.DEFAULT_DIR_SCRIPT = exports.DEFAULT_DIRECTORY = exports.DEFAULT_DIR_LANGUAGE = void 0;
const CaseType_1 = require("../util/CaseType");
const CombinationOptions_1 = require("./CombinationOptions");
// INTERNAL DIRECTORIES
exports.DEFAULT_DIR_LANGUAGE = 'data/';
// DIRECTORIES
exports.DEFAULT_DIRECTORY = '.';
exports.DEFAULT_DIR_SCRIPT = '.'; // 'test/';
exports.DEFAULT_DIR_RESULT = '.'; // 'output/'; // script results
// FILES
exports.DEFAULT_CONFIG = '.concordiarc'; // path
exports.DEFAULT_AST_FILE = 'ast.json'; // path
exports.DEFAULT_EXTENSION_FEATURE = '.feature'; // Extension for feature files
exports.DEFAULT_EXTENSION_TEST_CASE = '.testcase'; // Extension for test case files
exports.DEFAULT_LANGUAGE = 'en';
exports.DEFAULT_ENCODING = 'utf8';
exports.DEFAULT_LINE_BREAKER = "\n";
// CONTENT GENERATION
exports.DEFAULT_CASE_UI = CaseType_1.CaseType.CAMEL.toString(); // e.g., fullName
exports.DEFAULT_CASE_METHOD = CaseType_1.CaseType.SNAKE.toString(); // e.g., my_test_method
exports.DEFAULT_TC_INDENTER = '  '; // test case indenter
// RANDOMIC GENERATION
exports.DEFAULT_RANDOM_MIN_STRING_SIZE = 0;
exports.DEFAULT_RANDOM_MAX_STRING_SIZE = 500;
exports.DEFAULT_RANDOM_TRIES_TO_INVALID_VALUE = 5; // How many tries it will make to generate random values that are not in a set
exports.DEFAULT_IMPORTANCE = 5; // 0..9
// TEST SCENARIO SELECTION AND COMBINATION STRATEGIES
/** @see VariantSelectionOptions */
exports.DEFAULT_VARIANT_SELECTION = CombinationOptions_1.VariantSelectionOptions.SINGLE_RANDOM.toString();
/** @see StateCombinationOptions */
exports.DEFAULT_STATE_COMBINATION = CombinationOptions_1.CombinationOptions.SINGLE_RANDOM_OF_EACH.toString();
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
exports.DEFAULT_INVALID_DATA_TEST_CASES_AT_A_TIME = CombinationOptions_1.InvalidSpecialOptions.DEFAULT;
/** @see DataTestCaseCombinationOptions */
exports.DEFAULT_DATA_TEST_CASE_COMBINATION = CombinationOptions_1.CombinationOptions.SHUFFLED_ONE_WISE.toString();
/**
 * Returns available encodings.
 *
 * @see https://github.com/nodejs/node/blob/master/lib/buffer.js
 */
function availableEncodings() {
    return [
        'utf8', 'utf-8',
        'ascii',
        'latin1',
        'ucs2', 'ucs-2',
        'utf16le', 'utf-16le'
    ];
}
exports.availableEncodings = availableEncodings;
