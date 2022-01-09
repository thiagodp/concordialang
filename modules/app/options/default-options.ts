import { CaseType } from '../../util/CaseType';
import { CombinationOptions, InvalidSpecialOptions, VariantSelectionOptions } from './combination-options';

// DIRECTORIES

export const DEFAULT_DIRECTORY: string = '.';
export const DEFAULT_DIR_SCRIPT: string = '.'; // 'test/';
export const DEFAULT_DIR_RESULT: string = '.'; // 'output/'; // script results

// FILES

export const DEFAULT_CONFIG: string = '.concordiarc'; // path
export const DEFAULT_AST_FILE: string = 'ast.json'; // path

export const DEFAULT_EXTENSION_FEATURE = '.feature'; // Extension for feature files
export const DEFAULT_EXTENSION_TEST_CASE = '.testcase'; // Extension for test case files

export const DEFAULT_LANGUAGE: string = 'en';
export const DEFAULT_ENCODING: string = 'utf8';
export const DEFAULT_LINE_BREAKER: string = "\n";

export const DEFAULT_PACKAGE_MANAGER: string = 'npm';

// CONTENT GENERATION

export const DEFAULT_CASE_UI: string = CaseType.CAMEL.toString(); // e.g., fullName
export const DEFAULT_CASE_METHOD: string = CaseType.SNAKE.toString(); // e.g., my_test_method
export const DEFAULT_TC_INDENTER: string = '  '; // test case indenter

// RANDOMIC GENERATION

export const DEFAULT_RANDOM_MIN_STRING_SIZE: number = 0;
export const DEFAULT_RANDOM_MAX_STRING_SIZE: number = 500;
export const DEFAULT_RANDOM_TRIES_TO_INVALID_VALUE: number = 5; // How many tries it will make to generate random values that are not in a set

export const DEFAULT_IMPORTANCE: number = 5; // 0..9

// TEST SCENARIO SELECTION AND COMBINATION STRATEGIES

/** @see VariantSelectionOptions */
export const DEFAULT_VARIANT_SELECTION: string =
	VariantSelectionOptions.SINGLE_RANDOM.toString();

/** @see StateCombinationOptions */
export const DEFAULT_STATE_COMBINATION: string =
	CombinationOptions.SINGLE_RANDOM_OF_EACH.toString();

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
export const DEFAULT_INVALID_DATA_TEST_CASES_AT_A_TIME: number | string =
	InvalidSpecialOptions.DEFAULT;

/** @see DataTestCaseCombinationOptions */
export const DEFAULT_DATA_TEST_CASE_COMBINATION: string =
	CombinationOptions.SHUFFLED_ONE_WISE.toString();


/**
 * Returns available encodings.
 *
 * @see https://github.com/nodejs/node/blob/master/lib/buffer.js
 */
export function availableEncodings(): string[] {
	return [
		'utf8', 'utf-8',
		'ascii',
		'latin1',
		'ucs2', 'ucs-2',
		'utf16le', 'utf-16le'
	];
}
