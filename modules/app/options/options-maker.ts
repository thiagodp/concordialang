import { resolve } from 'path';

import { CliOnlyOptions } from './cli-only-options';
import { AppOptions } from './app-options';
import {
    DEFAULT_CASE_UI,
    DEFAULT_CONFIG,
    DEFAULT_DATA_TEST_CASE_COMBINATION,
    DEFAULT_DIR_RESULT,
    DEFAULT_DIR_SCRIPT,
    DEFAULT_DIRECTORY,
    DEFAULT_ENCODING,
    DEFAULT_EXTENSION_FEATURE,
    DEFAULT_EXTENSION_TEST_CASE,
	DEFAULT_PACKAGE_MANAGER,
    DEFAULT_IMPORTANCE,
    DEFAULT_INVALID_DATA_TEST_CASES_AT_A_TIME,
    DEFAULT_LANGUAGE,
    DEFAULT_LINE_BREAKER,
    DEFAULT_RANDOM_MAX_STRING_SIZE,
    DEFAULT_RANDOM_MIN_STRING_SIZE,
    DEFAULT_RANDOM_TRIES_TO_INVALID_VALUE,
    DEFAULT_STATE_COMBINATION,
    DEFAULT_TC_INDENTER,
    DEFAULT_VARIANT_SELECTION,
} from './default-options';


/**
 * Create app options.
 *
 * @param appPath Concordia directory.
 * @param processPath User process path.
 */
export function makeAppOptions(
	appPath: string = __dirname,
	processPath: string = process.cwd()
): AppOptions {

	// User-defined directories
	const directory = resolve( processPath, DEFAULT_DIRECTORY );
	const dirScript = resolve( processPath, DEFAULT_DIR_SCRIPT );
	const dirResult = resolve( processPath, DEFAULT_DIR_RESULT );

	const o: AppOptions = {

		// INTERNAL

		// debug: false,

		appPath,
		processPath,

		// isGeneratedSeed
		// realSeed

		// DIRECTORIES

		recursive: true,

		directory,
		dirScript,
		dirResult,

		packageManager: DEFAULT_PACKAGE_MANAGER,

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
		result: false, // run already collects the result

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



export function makeCliOnlyOptions( processPath: string ): CliOnlyOptions {
	return {
		config: resolve( processPath, DEFAULT_CONFIG ),
	};
}


export function makeAllOptions(
	appPath: string = __dirname,
	processPath: string = process.cwd()
): AppOptions & CliOnlyOptions {

	const obj: AppOptions & CliOnlyOptions = makeAppOptions( appPath, processPath );

	const cliOpt: CliOnlyOptions = makeCliOnlyOptions( processPath );
	for ( const k in cliOpt ) {
		obj[ k ] = cliOpt[ k ];
	}

	return obj;
}

