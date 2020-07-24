"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAllOptions = exports.makeCliOnlyOptions = exports.makeAppOptions = void 0;
const path_1 = require("path");
const defaults_1 = require("./defaults");
/**
 * Create app options.
 *
 * @param appPath Concordia directory.
 * @param processPath User process path.
 */
function makeAppOptions(appPath = __dirname, processPath = process.cwd()) {
    // Concordia directories
    const languageDir = path_1.resolve(appPath, defaults_1.DEFAULT_DIR_LANGUAGE);
    // User-defined directories
    const directory = path_1.resolve(processPath, defaults_1.DEFAULT_DIRECTORY);
    const dirScript = path_1.resolve(processPath, defaults_1.DEFAULT_DIR_SCRIPT);
    const dirResult = path_1.resolve(processPath, defaults_1.DEFAULT_DIR_RESULT);
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
        encoding: defaults_1.DEFAULT_ENCODING,
        extensionFeature: defaults_1.DEFAULT_EXTENSION_FEATURE,
        extensionTestCase: defaults_1.DEFAULT_EXTENSION_TEST_CASE,
        lineBreaker: defaults_1.DEFAULT_LINE_BREAKER,
        // LANGUAGE
        language: defaults_1.DEFAULT_LANGUAGE,
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
        caseUi: defaults_1.DEFAULT_CASE_UI,
        // tcSuppressHeader: false,
        tcIndenter: defaults_1.DEFAULT_TC_INDENTER,
        // RANDOMIC GENERATION
        // seed
        seed: '',
        randomMinStringSize: defaults_1.DEFAULT_RANDOM_MIN_STRING_SIZE,
        randomMaxStringSize: defaults_1.DEFAULT_RANDOM_MAX_STRING_SIZE,
        randomTriesToInvalidValue: defaults_1.DEFAULT_RANDOM_TRIES_TO_INVALID_VALUE,
        // SPECIFICATION SELECTION
        importance: defaults_1.DEFAULT_IMPORTANCE,
        // TEST SCENARIO SELECTION AND COMBINATION STRATEGIES
        combVariant: defaults_1.DEFAULT_VARIANT_SELECTION,
        combState: defaults_1.DEFAULT_STATE_COMBINATION,
        combInvalid: defaults_1.DEFAULT_INVALID_DATA_TEST_CASES_AT_A_TIME,
        combData: defaults_1.DEFAULT_DATA_TEST_CASE_COMBINATION,
    };
    return o;
}
exports.makeAppOptions = makeAppOptions;
function makeCliOnlyOptions(processPath) {
    return {
        config: path_1.resolve(processPath, defaults_1.DEFAULT_CONFIG),
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
