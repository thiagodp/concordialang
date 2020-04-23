import { CaseType } from '../util/CaseType';
import { VariantSelectionOptions, CombinationOptions, InvalidSpecialOptions } from './CombinationOptions';

/**
 * Default values
 */
export class Defaults {

    // INTERNAL DIRECTORIES

    readonly DIR_PLUGIN: string = 'plugins/';
    readonly DIR_LANGUAGE: string = 'data/';

    // DIRECTORIES

    readonly DIRECTORY: string = '.';
    readonly DIR_SCRIPTS: string = '.'; // 'test/';
    readonly DIR_RESULTS: string = '.'; // 'output/'; // script results

    // FILES

    readonly CONFIG: string = '.concordiarc'; // path
    readonly AST_FILE: string = 'ast.json'; // path

    readonly EXTENSION_FEATURE = '.feature'; // Extension for feature files
    readonly EXTENSION_TEST_CASE = '.testcase'; // Extension for test case files
    readonly EXTENSIONS: string[] = [ this.EXTENSION_FEATURE, this.EXTENSION_TEST_CASE ];

    readonly LANGUAGE: string = 'en';
    readonly ENCODING: string = 'utf8';
    readonly LINE_BREAKER: string = "\n";

    // CONTENT GENERATION

    readonly CASE_UI: string = CaseType.CAMEL.toString(); // e.g., fullName
    readonly CASE_METHOD: string = CaseType.SNAKE.toString(); // e.g., my_test_method
    readonly TC_INDENTER: string = '  '; // test case indenter

    // RANDOMIC GENERATION

    readonly RANDOM_MIN_STRING_SIZE: number = 0;
    readonly RANDOM_MAX_STRING_SIZE: number = 500;
    readonly RANDOM_TRIES_TO_INVALID_VALUE: number = 5; // How many tries it will make to generate random values that are not in a set

    readonly IMPORTANCE: number = 5; // 0..9

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