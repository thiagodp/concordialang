import getopts from 'getopts';

import { AppOptions } from '../app/app-options';
import { CliOnlyOptions } from './CliOnlyOptions';


interface ArgsResult {

	/** Detected values */
	input: string[];

	/** Detected arguments */
	flags: { [key: string]: any };

	/** Flags that were not recognized */
	unexpected?: { [key: string]: any };

	/** All the available flags and aliases */
	allFlags?: string[];
}

/**
 * Parses the given arguments.
 *
 * @param args Arguments to parse.
 * @return Parsed arguments.
 */
export function parseArgs( args: string[] ): ArgsResult {
	return parseWithGetOpts( args );
}


function parseWithGetOpts( inputArgs: string[] ): ArgsResult {

	const options = makeGetOptsOptions();

	const unexpected = {};
	options[ 'unknown' ] = k => unexpected[ k ] = 1;

	const aliases = options.alias;

	const args = getopts( inputArgs, options );
	// console.log( 'GETOPTS', args );

	// Put unknown arguments in the unexpected object
	const allArgs = [];
	for ( const k of Object.keys( args ) ) {
		if ( unexpected[ k ] ) {
			unexpected[ k ] = args[ k ];
			delete args[ k ];
		} else if ( k !== '_' ) {
			allArgs.push( k );
		}
	}

	// Remove aliases from the resulting object
	for ( const [ , v ] of Object.entries( aliases ) ) {
		if ( 'string' === typeof v ) {
			allArgs.push( v );
			delete args[ v ];
			continue;
		}
		for ( const e of ( v || [] ) ) {
			allArgs.push( e );
			delete args[ e ];
		}
	}

	// Removing input
	const input = args._;
	delete args[ "_" ];

	return { input, flags: args, unexpected, allFlags: allArgs };
}


function makeGetOptsOptions() {

	type OptionsKey = keyof ( AppOptions & CliOnlyOptions );

	type AliasType = {
		[ key in OptionsKey ]: string | string[]
	};

	type DefaultType = {
		[ key in OptionsKey ]: string | number | boolean
	};

	// type AdittionalFlags = 'x' |

	const alias: AliasType = {

		// INTERNAL
		directory: 'd',
		dirScript: [ 'dir-script', 'o' ],
		dirResult: [ 'dir-result', 'dir-output', 'O' ],

		// FILES
		file: [ 'files', 'f' ],
		ignore: 'i',
		scriptFile: [ 'script-file', 'script-files', 'F' ],
		scriptGrep: [ 'script-grep', 'G' ],

		// CONFIG
		config: 'c',
		saveConfig: 'save-config',

		// LANGUAGE
		language: 'l',
		languageList: 'language-list',

		// LOCALE
		localeList: 'locale-list',

		// FILE-RELATED OPTIONS
		encoding: 'e',
		lineBreaker: 'line-breaker',
		extensionFeature: [ 'extension-feature', 'ext-feature' ],
		extensionTestCase: [ 'extension-test-case', 'ext-test-case' ],

		// PLUG-IN
		plugin: 'p',
		pluginAbout: [ 'plugin-about', 'plugin-info' ],
		pluginInstall: 'plugin-install',
		pluginUninstall: 'plugin-uninstall',
		pluginServe: [ 'plugin-serve', 'S' ],
		pluginList: 'plugin-list',
		target: [ 'targets', 'T' ],
		headless: 'H',
		instances: 'I',

		// DATABASE
		dbInstall: 'db-install',
		dbUninstall: 'db-uninstall',
		dbList: 'db-list',

		// PROCESSING AND OUTPUT
		stopOnTheFirstError: 'fail-fast',

		testCase: 'test-case',

		justSpec: 'just-spec',
		justTestCase: 'just-test-case',
		justScript: 'just-script',
		justRun: 'just-run',
		justResult: 'just-result',

		// CONTENT GENERATION
		caseUi: 'case-ui',
		tcSuppressHeader: 'tc-suppress-header',
		tcIndenter: 'tc-indenter',

		// RANDOMIC GENERATION
		randomMinStringSize: 'random-min-string-size',
		randomMaxStringSize: 'random-max-string-size',
		randomTriesToInvalidValue: 'random-tries',

		// COMBINATION STRATEGIES
		combVariant: 'comb-variant',
		combState: 'comb-state',
		combInvalid: 'comb-invalid',
		combData: 'comb-data',

		// INFO
		version: 'v',
	} as AliasType;


	const defaultValues: DefaultType = {

		// DIRECTORIES
		recursive: true,

		// PROCESSING AND OUTPUT
		seed: undefined,

		spec: true,
		testCase: true,
		script: true,
		run: true,
		result: true,

		// justSpec: false,
		// justTestCase: false,
		// justScript: false,
		// justRun: false,


	} as DefaultType;


	const booleanKeys: OptionsKey[] = [

		// INTERNAL
		"debug",

		// DIRECTORIES
		"recursive",

		// CONFIG
		"init",
		"saveConfig",

		// LANGUAGE
		"languageList",

		// LOCALE
		"localeList",

		// PLUG-IN
		"pluginList",
		"headless",

		// DATABASE
		"dbList",

		// PROCESSING AND OUTPUT
		"verbose",
		"stopOnTheFirstError",

		"spec",
		"testCase",
		"script",
		"run",
		"result",

		"x",

		"justSpec",
		"justTestCase",
		"justScript",
		"justRun",
		"justResult",

		// CONTENT GENERATION
		"tcSuppressHeader",

		// INFO
		"help",
		"about",
		"version",
		"newer"
	];

	return {
		alias,
		default: defaultValues,
		boolean: booleanKeys
	};
}


// function getMeowResult(): ArgsResult {
// 	const r = meow( helpContent(), cliHelp.meowOptions() );
// 	return { input: r.input, flags: r.flags };
// }


// function meowOptions(): object {
// 	return {

// 		booleanDefault: undefined,

// 		flags: {

// 			// DIRECTORIES

// 			directory: { type: 'string', alias: 'd' },
// 			noRecursive: { type: 'boolean' },
// 			dirScript: { type: 'string', alias: 'o' },
// 			dirResult: { type: 'string', alias: 'O' },

// 			// FILES

// 			files: { type: 'string', alias: 'f' },
// 			ignore: { type: 'string', alias: 'i' },

// 			scriptFile: { type: 'string', alias: 'F' },
// 			scriptGrep: { type: 'string', alias: 'G' },

// 			// CONFIG

// 			init: { type: 'boolean' },
// 			config: { type: 'string', alias: 'c' },
// 			saveConfig: { type: 'boolean' },

// 			// LANGUAGE

// 			language: { type: 'string', alias: 'l' },
// 			languageList: { type: 'boolean' },

// 			// FILE-RELATED OPTIONS

// 			encoding: { type: 'string', alias: 'e' },
// 			lineBreaker: { type: 'string' },
// 			extFeature: { type: 'string' },
// 			extTestCases: { type: 'string' },

// 			// PLUG-IN

// 			plugin: { type: 'string', alias: 'p' },
// 			pluginAbout: { type: 'string' },
// 			pluginInstall: { type: 'string' },
// 			pluginUninstall: { type: 'string' },
// 			pluginServe: { type: 'string', alias: 'S' },
// 			pluginList: { type: 'boolean' },

// 			target: { type: 'string', alias: 'T' },
// 			headless: { type: 'boolean', alias: 'H' },
// 			instances: { type: 'integer', alias: 'I' },

// 			// DATABASE

// 			dbInstall: { type: 'string' },
// 			dbUninstall: { type: 'string' },
// 			dbList: { type: 'boolean' },

// 			// PROCESSING AND OUTPUT

// 			verbose: { type: 'boolean' },
// 			failFast: { type: 'boolean' },
// 			debug: { type: 'boolean' },

// 			noSpec: { type: 'boolean' },
// 			noTestCase: { type: 'boolean' },
// 			noScript: { type: 'boolean' },
// 			noRun: { type: 'boolean' },
// 			noResult: { type: 'boolean' },

// 			x: { type: 'boolean' },

// 			justSpec: { type: 'boolean' },
// 			justTestCase: { type: 'boolean' },
// 			justScript: { type: 'boolean' },
// 			justRun: { type: 'boolean' },

// 			// CONTENT GENERATION

// 			caseUi: { type: 'string' },
// 			caseMethod: { type: 'string' },
// 			tcSuppressHeader: { type: 'boolean' },
// 			tcIndenter: { type: 'string' },

// 			// RANDOMIC GENERATION

// 			seed: { type: 'string' },
// 			randomMinStringSize: { type: 'integer' },
// 			randomMaxStringSize: { type: 'integer' },
// 			randomTries: { type: 'integer' },

// 			// COMBINATION STRATEGIES

// 			combVariant: { type: 'string' },
// 			combState: { type: 'string' },
// 			combInvalid: { type: 'string' },
// 			combData: { type: 'string' },

// 			// // SPECIFICATION FILTERING

// 			// importance: { type: 'integer' },
// 			// selMinFeature: { type: 'integer' },
// 			// selMaxFeature: { type: 'integer' },
// 			// selMinScenario: { type: 'integer' },
// 			// selMaxScenario: { type: 'integer' },
// 			// selFilter: { type: 'string' },

// 			// // TEST SCRIPT FILTERING

// 			// runMinFeature: { type: 'integer' },
// 			// runMaxFeature: { type: 'integer' },
// 			// runMinScenario: { type: 'integer' },
// 			// runMaxScenario: { type: 'integer' },
// 			// runFilter: { type: 'string' },

// 			// INFO

// 			help: { type: 'boolean' },
// 			about: { type: 'boolean' },
// 			version: { type: 'boolean', alias: 'v' },
// 			newer: { type: 'boolean' },
// 		}
// 	};
// }
