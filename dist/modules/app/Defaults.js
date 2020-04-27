"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CaseType_1 = require("../util/CaseType");
const CombinationOptions_1 = require("./CombinationOptions");
/**
 * Default values
 */
class Defaults {
    constructor() {
        // INTERNAL DIRECTORIES
        this.DIR_PLUGIN = 'plugins/';
        this.DIR_LANGUAGE = 'data/';
        // DIRECTORIES
        this.DIRECTORY = '.';
        this.DIR_SCRIPT = '.'; // 'test/';
        this.DIR_RESULT = '.'; // 'output/'; // script results
        // FILES
        this.CONFIG = '.concordiarc'; // path
        this.AST_FILE = 'ast.json'; // path
        this.EXTENSION_FEATURE = '.feature'; // Extension for feature files
        this.EXTENSION_TEST_CASE = '.testcase'; // Extension for test case files
        this.EXTENSIONS = [this.EXTENSION_FEATURE, this.EXTENSION_TEST_CASE];
        this.LANGUAGE = 'en';
        this.ENCODING = 'utf8';
        this.LINE_BREAKER = "\n";
        // CONTENT GENERATION
        this.CASE_UI = CaseType_1.CaseType.CAMEL.toString(); // e.g., fullName
        this.CASE_METHOD = CaseType_1.CaseType.SNAKE.toString(); // e.g., my_test_method
        this.TC_INDENTER = '  '; // test case indenter
        // RANDOMIC GENERATION
        this.RANDOM_MIN_STRING_SIZE = 0;
        this.RANDOM_MAX_STRING_SIZE = 500;
        this.RANDOM_TRIES_TO_INVALID_VALUE = 5; // How many tries it will make to generate random values that are not in a set
        this.IMPORTANCE = 5; // 0..9
        // TEST SCENARIO SELECTION AND COMBINATION STRATEGIES
        /** @see VariantSelectionOptions */
        this.VARIANT_SELECTION = CombinationOptions_1.VariantSelectionOptions.SINGLE_RANDOM.toString();
        /** @see StateCombinationOptions */
        this.STATE_COMBINATION = CombinationOptions_1.CombinationOptions.SINGLE_RANDOM_OF_EACH.toString();
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
        this.INVALID_DATA_TEST_CASES_AT_A_TIME = CombinationOptions_1.InvalidSpecialOptions.DEFAULT;
        /** @see DataTestCaseCombinationOptions */
        this.DATA_TEST_CASE_COMBINATION = CombinationOptions_1.CombinationOptions.SHUFFLED_ONE_WISE.toString();
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
