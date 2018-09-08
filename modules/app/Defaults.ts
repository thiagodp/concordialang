import { CaseType } from './CaseType';

/**
 * Reduces the Variants that produce a certain State required by a Precondition
 * or by a State Call. The scenarios of these Variants will be combined with
 * the current scenario. Thus, the lesser the Variants to combine, the lower is
 * the number of produced Test Scenarios and so is will be the number of Test Cases.
 *
 * @see VariantSelectionStrategy
 */
export enum VariantSelectionOptions {
    SINGLE_RANDOM = 'random',
    FIRST = 'first',
    FIRST_MOST_IMPORTANT = 'fmi',
    ALL = 'all'
}

/**
 * Generic combination options
 *
 * @see CombinationStrategy
 */
export enum CombinationOptions {
    SINGLE_RANDOM_OF_EACH = 'sre',
    SHUFFLED_ONE_WISE = 'sow',
    ONE_WISE = 'ow',
    ALL = 'all'
}

/**
 * Indicates the combination of States, i.e., how the Test Scenarios that will
 * replace them will be combined.
 *
 * Every Precondition and State Call has to be replaced by a Test Scenario. However,
 * each one may have many Test Scenarios, and their combination may produce a lot
 * of new Test Scenarios.
 *
 * @see CombinationOptions
 */
export type StateCombinationOptions = CombinationOptions;

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
export enum InvalidSpecialOptions {

    NONE = 'none', // same as 0 invalid

    ALL = 'all',  // all invalid

    /**
     * Leave the mix untouched (i.e., does not filter the DataTestCases of each UI Element ) and
     * apply SHUFFLED_ONE_WISE combination for the DataTestCases.
     *
     * !!! THIS OPTION CHANGES THE COMBINATION OF DataTestCases THAT WAS CHOSEN BY THE USER !!!
     */
    RANDOM = 'random',

    /**
     * Leave the mix untouched (i.e., does not filter the DataTestCases of each UI Element ).
     */
    DEFAULT = 'smart'
}

/**
 * Indicates how the DataTestCases of each UI Element will be combined.
 *
 * @see CombinationOptions
 */
export type DataTestCaseCombinationOptions = CombinationOptions;

/**
 * Default values
 */
export class Defaults {

    readonly LANGUAGE: string = 'en';
    readonly ENCODING: string = 'utf8';

    readonly EXTENSION_FEATURE = '.feature'; // Extension for feature files
    readonly EXTENSION_TEST_CASE = '.testcase'; // Extension for test case files

    readonly EXTENSIONS: string[] = [ this.EXTENSION_FEATURE, this.EXTENSION_TEST_CASE ];

    readonly CFG_FILE_NAME = '.concordiarc'; // Name for configuration files

    readonly DIR_PLUGIN: string = 'plugins/';
    readonly DIR_LANGUAGE: string = 'data/';
    readonly DIR_TEST_CASE: string = null; // null means "same as the feature file"
    readonly DIR_SCRIPT: string = 'test/';
    readonly DIR_SCRIPT_RESULT: string = 'output/';

    // CONTENT GENERATION

    readonly CASE_UI: string = CaseType.CAMEL.toString(); // e.g., fullName
    readonly CASE_METHOD: string = CaseType.SNAKE.toString(); // e.g., my_test_method
    readonly TC_INDENTER: string = '  '; // test case indenter

    // RANDOMIC GENERATION

    readonly RANDOM_MIN_STRING_SIZE: number = 0;
    readonly RANDOM_MAX_STRING_SIZE: number = 500;
    readonly RANDOM_TRIES_TO_INVALID_VALUE: number = 5; // How many tries it will make to generate random values that are not in a set

    readonly IMPORTANCE: number = 5; // 0..9

    readonly LINE_BREAKER: string = "\n";

    // TEST SCENARIO SELECTION AND COMBINATION STRATEGIES

    /** @see VariantSelectionOptions */
    readonly VARIANT_SELECTION: string = VariantSelectionOptions.SINGLE_RANDOM.toString();

    /** @see StateCombinationOptions */
    readonly STATE_COMBINATION: string = CombinationOptions.SINGLE_RANDOM_OF_EACH.toString();

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
    readonly INVALID_DATA_TEST_CASES_AT_A_TIME: number | string = InvalidSpecialOptions.DEFAULT;

    /** @see DataTestCaseCombinationOptions */
    readonly DATA_TEST_CASE_COMBINATION: string = CombinationOptions.SHUFFLED_ONE_WISE.toString();


    // UTILITIES

    /**
     * Returns available encodings.
     *
     * @see https://github.com/nodejs/node/blob/master/lib/buffer.js
     */
    availableEncodings(): string[] {
        return [
            'utf8', 'utf-8',
            'ascii',
            'latin1',
            'ucs2', 'ucs-2',
            'utf16le', 'utf-16le'
        ];
    }

}