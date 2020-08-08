"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAllOptions = exports.makeCliOnlyOptions = exports.makeAppOptions = void 0;
const path_1 = require("path");
const default_options_1 = require("./default-options");
/**
 * Create app options.
 *
 * @param appPath Concordia directory.
 * @param processPath User process path.
 */
function makeAppOptions(appPath = __dirname, processPath = process.cwd()) {
    // Concordia directories
    const languageDir = path_1.resolve(appPath, default_options_1.DEFAULT_DIR_LANGUAGE);
    // User-defined directories
    const directory = path_1.resolve(processPath, default_options_1.DEFAULT_DIRECTORY);
    const dirScript = path_1.resolve(processPath, default_options_1.DEFAULT_DIR_SCRIPT);
    const dirResult = path_1.resolve(processPath, default_options_1.DEFAULT_DIR_RESULT);
    const o = {
        // INTERNAL
        // debug: false,
        appPath,
        processPath,
        languageDir,
        // isGeneratedSeed
        // realSeed
        // DIRECTORIES
        recursive: true,
        directory,
        dirScript,
        dirResult,
        ignore: [],
        file: [],
        scriptFile: [],
        // scriptGrep
        // FILE-RELATED OPTIONS
        encoding: default_options_1.DEFAULT_ENCODING,
        extensionFeature: default_options_1.DEFAULT_EXTENSION_FEATURE,
        extensionTestCase: default_options_1.DEFAULT_EXTENSION_TEST_CASE,
        lineBreaker: default_options_1.DEFAULT_LINE_BREAKER,
        // LANGUAGE
        language: default_options_1.DEFAULT_LANGUAGE,
        // PLUGIN
        // plugin
        // target
        // headless
        // instances
        // PROCESSING
        // verbose: false,
        // stopOnTheFirstError: false,
        spec: true,
        testCase: true,
        script: true,
        run: true,
        result: false,
        // headless: false,
        // CONTENT GENERATION
        caseUi: default_options_1.DEFAULT_CASE_UI,
        // tcSuppressHeader: false,
        tcIndenter: default_options_1.DEFAULT_TC_INDENTER,
        // RANDOMIC GENERATION
        // seed
        // seed: '', // will be ignored
        randomMinStringSize: default_options_1.DEFAULT_RANDOM_MIN_STRING_SIZE,
        randomMaxStringSize: default_options_1.DEFAULT_RANDOM_MAX_STRING_SIZE,
        randomTriesToInvalidValue: default_options_1.DEFAULT_RANDOM_TRIES_TO_INVALID_VALUE,
        // SPECIFICATION SELECTION
        importance: default_options_1.DEFAULT_IMPORTANCE,
        // TEST SCENARIO SELECTION AND COMBINATION STRATEGIES
        combVariant: default_options_1.DEFAULT_VARIANT_SELECTION,
        combState: default_options_1.DEFAULT_STATE_COMBINATION,
        combInvalid: default_options_1.DEFAULT_INVALID_DATA_TEST_CASES_AT_A_TIME,
        combData: default_options_1.DEFAULT_DATA_TEST_CASE_COMBINATION,
    };
    return o;
}
exports.makeAppOptions = makeAppOptions;
function makeCliOnlyOptions(processPath) {
    return {
        config: path_1.resolve(processPath, default_options_1.DEFAULT_CONFIG),
    };
}
exports.makeCliOnlyOptions = makeCliOnlyOptions;
function makeAllOptions(appPath = __dirname, processPath = process.cwd()) {
    const obj = makeAppOptions(appPath, processPath);
    const cliOpt = makeCliOnlyOptions(processPath);
    for (const k in cliOpt) {
        obj[k] = cliOpt[k];
    }
    return obj;
}
exports.makeAllOptions = makeAllOptions;
