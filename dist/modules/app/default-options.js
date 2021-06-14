import { CaseType } from '../util/CaseType';
import { CombinationOptions, InvalidSpecialOptions, VariantSelectionOptions } from './combination-options';
// INTERNAL DIRECTORIES
export const DEFAULT_DIR_LANGUAGE = 'data/';
// DIRECTORIES
export const DEFAULT_DIRECTORY = '.';
export const DEFAULT_DIR_SCRIPT = '.'; // 'test/';
export const DEFAULT_DIR_RESULT = '.'; // 'output/'; // script results
// FILES
export const DEFAULT_CONFIG = '.concordiarc'; // path
export const DEFAULT_AST_FILE = 'ast.json'; // path
export const DEFAULT_EXTENSION_FEATURE = '.feature'; // Extension for feature files
export const DEFAULT_EXTENSION_TEST_CASE = '.testcase'; // Extension for test case files
export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_ENCODING = 'utf8';
export const DEFAULT_LINE_BREAKER = "\n";
// CONTENT GENERATION
export const DEFAULT_CASE_UI = CaseType.CAMEL.toString(); // e.g., fullName
export const DEFAULT_CASE_METHOD = CaseType.SNAKE.toString(); // e.g., my_test_method
export const DEFAULT_TC_INDENTER = '  '; // test case indenter
// RANDOMIC GENERATION
export const DEFAULT_RANDOM_MIN_STRING_SIZE = 0;
export const DEFAULT_RANDOM_MAX_STRING_SIZE = 500;
export const DEFAULT_RANDOM_TRIES_TO_INVALID_VALUE = 5; // How many tries it will make to generate random values that are not in a set
export const DEFAULT_IMPORTANCE = 5; // 0..9
// TEST SCENARIO SELECTION AND COMBINATION STRATEGIES
/** @see VariantSelectionOptions */
export const DEFAULT_VARIANT_SELECTION = VariantSelectionOptions.SINGLE_RANDOM.toString();
/** @see StateCombinationOptions */
export const DEFAULT_STATE_COMBINATION = CombinationOptions.SINGLE_RANDOM_OF_EACH.toString();
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
export const DEFAULT_INVALID_DATA_TEST_CASES_AT_A_TIME = InvalidSpecialOptions.DEFAULT;
/** @see DataTestCaseCombinationOptions */
export const DEFAULT_DATA_TEST_CASE_COMBINATION = CombinationOptions.SHUFFLED_ONE_WISE.toString();
/**
 * Returns available encodings.
 *
 * @see https://github.com/nodejs/node/blob/master/lib/buffer.js
 */
export function availableEncodings() {
    return [
        'utf8', 'utf-8',
        'ascii',
        'latin1',
        'ucs2', 'ucs-2',
        'utf16le', 'utf-16le'
    ];
}
