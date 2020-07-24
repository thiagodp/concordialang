"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSomePluginAction = void 0;
function hasSomePluginAction(o) {
    return o.pluginList
        || !!o.pluginAbout
        || !!o.pluginInstall
        || !!o.pluginUninstall
        || !!o.pluginServe;
}
exports.hasSomePluginAction = hasSomePluginAction;
// /**
//  * CLI options
//  */
// export interface CliOptions extends CliOnlyOptions {
// 	// INTERNAL
// 	/** Debug mode */
// 	debug?: boolean;
//     // DIRECTORIES
//     /** Recursive search flag */
//     recursive?: boolean;
//     /** Directory with specification files */
//     directory?: string;
//     /** Output directory for test script files */
//     dirScript?: string;
//     /** Output directory of test script results */
//     dirResult?: string;
//     // FILES
//     /** Files to ignore, from the given directory */
//     ignore?: string;
//     /** Files to consider, instead of the given directory */
//     file?: string;
//     /** Script files to execute */
//     scriptFile?: string;
//     /** Send an expression to filter the test scripts to run. Some plug-ins may not support it. */
//     scriptGrep?: string;
//     // FILE-RELATED OPTIONS
//     /** Default encoding */
// 	encoding?: string;
//     /** Extension for feature files */
//     extensionFeature?: string;
//     /** Extension for test case files */
//     extensionTestCase?: string;
//     /** Characters used to break lines in text files */
//     lineBreaker?: string;
// 	// LANGUAGE
// 	/** Default language */
//     language?: string;
//     // PLUGIN
//     /** Plug-in (name) to use */
//     plugin?: string;
//     /** Target browsers or platforms */
//     target?: string;
//     /** Headless test script execution. Browsers only. Some plug-ins may not support it. */
//     headless?: boolean;
//     /** Parallel instances to run. Some plug-ins may not support it. */
// 	instances?: number;
//     // PROCESSING
//     /** Verbose output */
//     verbose?: boolean;
//     /** Stop on the first error */
//     stopOnTheFirstError?: boolean;
//     /** Whether it is desired to compile the specification */
//     compileSpecification?: boolean;
//     /** Whether it is desired to generate test case files */
//     generateTestCase?: boolean;
//     /** Whether it is desired to generate test script files */
//     generateScript?: boolean;
//     /** Whether it is desired to execute test script files */
//     executeScript?: boolean;
//     /** Whether it is desired to analyze test script results */
//     analyzeResult?: boolean;
//     // CONTENT GENERATION
//     /**
//      * String case used for UI Elements' ids when an id is not defined.
//      *
//      * @see CaseType
//      */
//     caseUi?: string;
//     /** Whether it is desired to suppress header comments in test case files */
//     tcSuppressHeader?: boolean;
//     /** Character used as indenter for test case files */
//     tcIndenter?: string;
//     // RANDOMIC GENERATION
//     /** Seed */
//     seed?: string;
//     // /** Number of test cases with valid random values */
//     // randomValid?: number = 1;
//     // /** Number of test cases with invalid random values */
//     // randomInvalid?: number = 1;
//     /** Minimum size for random strings */
//     randomMinStringSize?: number;
//     /** Maximum size for random strings */
//     randomMaxStringSize?: number;
//     /** How many tries it will make to generate random values that are not in a set */
//     randomTriesToInvalidValue?: number;
//     // SPECIFICATION SELECTION
//     /** Default importance value */
//     importance?: number;
//     // TEST SCENARIO SELECTION AND COMBINATION STRATEGIES
//     /** @see VariantSelectionOptions */
//     combVariant?: string;
//     /** @see StateCombinationOptions */
//     combState?: string;
//     // SELECTION AND COMBINATION STRATEGIES FOR DATA TEST CASES
//     /** @see Defaults */
//     combInvalid?: number | string;
//     /** @see DataTestCaseCombinationOptions */
//     combData?: string;
// }
