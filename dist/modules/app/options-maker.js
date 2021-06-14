import { resolve } from 'path';
import { DEFAULT_CASE_UI, DEFAULT_CONFIG, DEFAULT_DATA_TEST_CASE_COMBINATION, DEFAULT_DIR_LANGUAGE, DEFAULT_DIR_RESULT, DEFAULT_DIR_SCRIPT, DEFAULT_DIRECTORY, DEFAULT_ENCODING, DEFAULT_EXTENSION_FEATURE, DEFAULT_EXTENSION_TEST_CASE, DEFAULT_IMPORTANCE, DEFAULT_INVALID_DATA_TEST_CASES_AT_A_TIME, DEFAULT_LANGUAGE, DEFAULT_LINE_BREAKER, DEFAULT_RANDOM_MAX_STRING_SIZE, DEFAULT_RANDOM_MIN_STRING_SIZE, DEFAULT_RANDOM_TRIES_TO_INVALID_VALUE, DEFAULT_STATE_COMBINATION, DEFAULT_TC_INDENTER, DEFAULT_VARIANT_SELECTION, } from './default-options';
/**
 * Create app options.
 *
 * @param appPath Concordia directory.
 * @param processPath User process path.
 */
export function makeAppOptions(appPath = __dirname, processPath = process.cwd()) {
    // Concordia directories
    const languageDir = resolve(appPath, DEFAULT_DIR_LANGUAGE);
    // User-defined directories
    const directory = resolve(processPath, DEFAULT_DIRECTORY);
    const dirScript = resolve(processPath, DEFAULT_DIR_SCRIPT);
    const dirResult = resolve(processPath, DEFAULT_DIR_RESULT);
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
        packageManager: 'npm',
        ignore: [],
        file: [],
        scriptFile: [],
        // scriptGrep
        // FILE-RELATED OPTIONS
        encoding: DEFAULT_ENCODING,
        extensionFeature: DEFAULT_EXTENSION_FEATURE,
        extensionTestCase: DEFAULT_EXTENSION_TEST_CASE,
        lineBreaker: DEFAULT_LINE_BREAKER,
        // LANGUAGE
        language: DEFAULT_LANGUAGE,
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
        caseUi: DEFAULT_CASE_UI,
        // tcSuppressHeader: false,
        tcIndenter: DEFAULT_TC_INDENTER,
        // RANDOMIC GENERATION
        // seed
        // seed: '', // will be ignored
        randomMinStringSize: DEFAULT_RANDOM_MIN_STRING_SIZE,
        randomMaxStringSize: DEFAULT_RANDOM_MAX_STRING_SIZE,
        randomTriesToInvalidValue: DEFAULT_RANDOM_TRIES_TO_INVALID_VALUE,
        // SPECIFICATION SELECTION
        importance: DEFAULT_IMPORTANCE,
        // TEST SCENARIO SELECTION AND COMBINATION STRATEGIES
        combVariant: DEFAULT_VARIANT_SELECTION,
        combState: DEFAULT_STATE_COMBINATION,
        combInvalid: DEFAULT_INVALID_DATA_TEST_CASES_AT_A_TIME,
        combData: DEFAULT_DATA_TEST_CASE_COMBINATION,
    };
    return o;
}
export function makeCliOnlyOptions(processPath) {
    return {
        config: resolve(processPath, DEFAULT_CONFIG),
    };
}
export function makeAllOptions(appPath = __dirname, processPath = process.cwd()) {
    const obj = makeAppOptions(appPath, processPath);
    const cliOpt = makeCliOnlyOptions(processPath);
    for (const k in cliOpt) {
        obj[k] = cliOpt[k];
    }
    return obj;
}
