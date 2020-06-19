"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enumUtil = require("enum-util");
const path_1 = require("path");
const TypeChecking_1 = require("../util/TypeChecking");
const CaseType_1 = require("../util/CaseType");
const Defaults_1 = require("./Defaults");
const CombinationOptions_1 = require("./CombinationOptions");
/**
 * Application options
 *
 * @author Thiago Delgado Pinto
 */
class Options {
    constructor(appPath = __dirname, processPath = process.cwd()) {
        // console.log( 'App path (main.js)', appPath, 'Process path', processPath );
        this.appPath = appPath;
        this.processPath = processPath;
        // Default values - not updatable
        this.defaults = new Defaults_1.Defaults();
        /**
         * Parameters that should not be saved. The other parameters should only
         * be saved if they are different from the default ones (new Options()).
         */
        this.PARAMS_TO_IGNORE = [
            'PARAMS_TO_IGNORE',
            'defaults',
            'appPath',
            'processPath',
            // Language
            'languageList',
            // Plugin
            'pluginList',
            'pluginAbout',
            'pluginInstall',
            'pluginUninstall',
            'pluginServe',
            // Database
            `dbList`,
            'dbInstall',
            'dbUninstall',
            // Locale
            `localeList`,
            // Processing
            'init',
            'saveConfig',
            'ast',
            // Randomic generation
            'isGeneratedSeed',
            'realSeed',
            // Info
            'help',
            'about',
            'version',
            'newer',
            // Internal
            'debug',
            'pluginDir',
            'languageDir'
        ];
        // DIRECTORIES
        /** Recursive search flag */
        this.recursive = true;
        /** Directory with specification files */
        this.directory = this.defaults.DIRECTORY;
        /** Output directory for test script files */
        this.dirScript = this.defaults.DIR_SCRIPT;
        /** Output directory of test script results */
        this.dirResult = this.defaults.DIR_RESULT;
        // FILES
        /** Configuration file path */
        this.config = this.defaults.CONFIG;
        /** Files to ignore, from the given directory */
        this.ignore = [];
        /** Files to consider, instead of the given directory */
        this.file = [];
        /** Script files to execute */
        this.scriptFile = [];
        /** Send an expression to filter the test scripts to run. Some plug-ins may not support it. */
        this.scriptGrep = null;
        // FILE-RELATED OPTIONS
        /** Default encoding */
        this.encoding = this.defaults.ENCODING;
        this.extensions = this.defaults.EXTENSIONS; // extensions to search // TO-DO: integrate this with extensionFeature and extensionTestCase
        /** Extension for feature files */
        this.extensionFeature = this.defaults.EXTENSION_FEATURE;
        /** Extension for test case files */
        this.extensionTestCase = this.defaults.EXTENSION_TEST_CASE;
        /** Characters used to break lines in text files */
        this.lineBreaker = this.defaults.LINE_BREAKER;
        // Language
        this.language = this.defaults.LANGUAGE; // change default language
        this.languageList = false; // show available languages
        // PLUGIN
        /** Plug-in (name) to use */
        this.plugin = null;
        /** Show available plug-ins */
        this.pluginList = false;
        /** Show information about a plug-in */
        this.pluginAbout = false;
        /** Install an available plug-in */
        this.pluginInstall = false;
        /** Uninstall an available plug-in */
        this.pluginUninstall = false;
        /** Start the test server of a plug-in */
        this.pluginServe = false;
        /**
         * CLI options to be repassed to the plug-in.
         * This could be removed in a near future since plug-ins can be executed
         * via code by the plug-ins.
         */
        // public pluginOption: string = null;
        /** Target browsers or platforms */
        this.target = null;
        /** Headless test script execution. Browsers only. Some plug-ins may not support it. */
        this.headless = null;
        // DATABASE
        /** Show available databases */
        this.dbList = false;
        // LOCALE
        /** Show available locales */
        this.localeList = false;
        // PROCESSING
        /** Whether it is wanted to execute a guided configuration */
        this.init = false;
        /** Whether it is desired to save/overwrite a configuration file */
        this.saveConfig = false;
        /** Generates an AST file instead of executing anything else */
        this.ast = null;
        /** Verbose output */
        this.verbose = false;
        /** Stop on the first error */
        this.stopOnTheFirstError = false;
        /** Whether it is desired to compile the specification */
        this.compileSpecification = true;
        /** Whether it is desired to generate test case files */
        this.generateTestCase = true;
        /** Whether it is desired to generate test script files */
        this.generateScript = true;
        /** Whether it is desired to execute test script files */
        this.executeScript = true;
        /** Whether it is desired to analyze test script results */
        this.analyzeResult = true;
        // CONTENT GENERATION
        /**
         * String case used for UI Elements' ids when an id is not defined.
         *
         * @see CaseType
         */
        this.caseUi = this.defaults.CASE_UI;
        /**
         * String case used for test scripts' methods.
         *
         * @see CaseType
         */
        this.caseMethod = this.defaults.CASE_METHOD;
        /** Whether it is desired to suppress header comments in test case files */
        this.tcSuppressHeader = false;
        /** Character used as indenter for test case files */
        this.tcIndenter = this.defaults.TC_INDENTER;
        // RANDOMIC GENERATION
        /** Seed */
        this.seed = null;
        /** Indicates whether the seed was generated by Concordia or not */
        this.isGeneratedSeed = false;
        /**
         * Real seed to use. If the seed is less than 64 characters, the real seed
         * should be its SHA-512 hash.
         */
        this.realSeed = null;
        // /** Number of test cases with valid random values */
        // public randomValid: number = 1;
        // /** Number of test cases with invalid random values */
        // public randomInvalid: number = 1;
        /** Minimum size for random strings */
        this.randomMinStringSize = this.defaults.RANDOM_MIN_STRING_SIZE;
        /** Maximum size for random strings */
        this.randomMaxStringSize = this.defaults.RANDOM_MAX_STRING_SIZE;
        /** How many tries it will make to generate random values that are not in a set */
        this.randomTriesToInvalidValue = this.defaults.RANDOM_TRIES_TO_INVALID_VALUE;
        // SPECIFICATION SELECTION
        /** Default importance value */
        this.importance = this.defaults.IMPORTANCE;
        /** Minimum feature importance */
        this.selMinFeature = 0;
        /** Maximum feature importance */
        this.selMaxFeature = 0;
        /** Minimum scenario importance */
        this.selMinScenario = 0;
        /** Maximum scenario importance */
        this.selMaxScenario = 0;
        /** Filter by tags
         * @see https://github.com/telefonicaid/tartare#tags-and-filters */
        this.selFilter = '';
        // TEST SCENARIO SELECTION AND COMBINATION STRATEGIES
        /** @see VariantSelectionOptions */
        this.combVariant = this.defaults.VARIANT_SELECTION;
        /** @see StateCombinationOptions */
        this.combState = this.defaults.STATE_COMBINATION;
        // SELECTION AND COMBINATION STRATEGIES FOR DATA TEST CASES
        /** @see Defaults */
        this.combInvalid = this.defaults.INVALID_DATA_TEST_CASES_AT_A_TIME;
        /** @see DataTestCaseCombinationOptions */
        this.combData = this.defaults.DATA_TEST_CASE_COMBINATION;
        // Test script filtering
        this.runMinFeature = 0; // minimum feature importance
        this.runMaxFeature = 0; // maximum feature importance
        this.runMinScenario = 0; // minimum scenario importance
        this.runMaxScenario = 0; // maximum scenario importance
        this.runFilter = ''; // filter by tags @see https://github.com/telefonicaid/tartare#tags-and-filters
        // Info
        this.help = false; // show help
        this.about = false; // show about
        this.version = false; // show version
        this.newer = false; // check for version updates
        this.debug = false; // debug mode
        // Internal
        this.pluginDir = this.defaults.DIR_PLUGIN;
        this.languageDir = this.defaults.DIR_LANGUAGE;
        // @see https://github.com/zeit/pkg#assets
        // const isSnapshot = 0 === appPath.indexOf( '/snapshot' )
        //     || 0 === appPath.indexOf( 'C:\\snapshot' );
        // if ( isSnapshot ) {
        //     appPath = processPath; // Both plugins and languages are loaded dynamically
        // }
        // Concordia directories
        this.pluginDir = path_1.resolve(appPath, this.defaults.DIR_PLUGIN);
        this.languageDir = path_1.resolve(appPath, this.defaults.DIR_LANGUAGE);
        // Use-defined directories
        this.directory = path_1.resolve(processPath, this.defaults.DIRECTORY);
        this.dirScript = path_1.resolve(processPath, this.defaults.DIR_SCRIPT);
        this.dirResult = path_1.resolve(processPath, this.defaults.DIR_RESULT);
        // Use-defined files
        this.config = path_1.resolve(processPath, this.defaults.CONFIG);
    }
    shouldSeeHelp() {
        return this.help
            && !this.about
            && !(this.someInfoOption());
        /*
        ! this.seeAbout
            || ! ( this.someInfoOption() )
            || ( this.seeHelp
                // or do not want to do anything
                ||
                ( ! this.somePluginOption()
                && ! this.wantToCompile
                && ! this.wantToGenerateTestCases
                && ! this.wantToGenerateScripts
                && ! this.wantToExecuteScripts
                && ! this.wantToReadResults )
                // or want to do something with a plugin but its name is not defined
                ||
                ( ! this.pluginName &&
                    ( this.wantToGenerateScripts
                    ||  this.wantToExecuteScripts
                    || this.wantToReadResults )
                )
            );
            */
    }
    hasAnySpecificationFilter() {
        return this.hasFeatureFilter()
            || this.hasScenarioFilter()
            || this.hasTagFilter();
    }
    hasFeatureFilter() {
        return this.selMinFeature > 0 || this.selMaxFeature > 0;
    }
    hasScenarioFilter() {
        return this.selMinScenario > 0 || this.selMaxScenario > 0;
    }
    hasTagFilter() {
        return this.selFilter != '';
    }
    someInfoOption() {
        return this.help || this.about || this.version;
    }
    somePluginOption() {
        // `pluginOptions` is ignored
        return this.pluginList
            || this.pluginAbout
            || this.pluginInstall
            || this.pluginUninstall
            || this.pluginServe;
    }
    someOptionThatRequiresAPlugin() {
        return this.generateScript || this.executeScript || this.analyzeResult;
    }
    hasPluginName() {
        return this.plugin !== null && this.plugin !== undefined;
    }
    typedCaseUI() {
        if (enumUtil.isValue(CaseType_1.CaseType, this.caseUi)) {
            return this.caseUi;
        }
        if (enumUtil.isValue(CaseType_1.CaseType, this.defaults.CASE_UI)) {
            return this.defaults.CASE_UI;
        }
        return CaseType_1.CaseType.CAMEL;
    }
    typedVariantSelection() {
        if (enumUtil.isValue(CombinationOptions_1.VariantSelectionOptions, this.combVariant)) {
            return this.combVariant;
        }
        if (enumUtil.isValue(CombinationOptions_1.VariantSelectionOptions, this.defaults.VARIANT_SELECTION)) {
            return this.defaults.VARIANT_SELECTION;
        }
        return CombinationOptions_1.VariantSelectionOptions.SINGLE_RANDOM;
    }
    typedStateCombination() {
        return this.typedCombinationFor(this.combState, this.defaults.STATE_COMBINATION);
    }
    typedDataCombination() {
        return this.typedCombinationFor(this.combData, this.defaults.DATA_TEST_CASE_COMBINATION);
    }
    typedCombinationFor(value, defaultValue) {
        if (enumUtil.isValue(CombinationOptions_1.CombinationOptions, value)) {
            return value;
        }
        if (enumUtil.isValue(CombinationOptions_1.CombinationOptions, defaultValue)) {
            return defaultValue;
        }
        return CombinationOptions_1.CombinationOptions.SHUFFLED_ONE_WISE;
    }
    /**
     * Set attributes from a given object.
     *
     * @param obj Object
     */
    import(obj) {
        const PARAM_SEPARATOR = ',';
        // Helper functions
        const isStringNotEmpty = text => TypeChecking_1.isString(text) && text.trim() != '';
        const resolvePath = p => path_1.isAbsolute(p) ? p : path_1.resolve(this.processPath, p);
        // DIRECTORIES
        this.recursive = obj.recursive !== false;
        if (isStringNotEmpty(obj.directory)) {
            this.directory = resolvePath(obj.directory);
        }
        if (isStringNotEmpty(obj.dirScript)) { // singular
            this.dirScript = resolvePath(obj.dirScript);
        }
        else if (isStringNotEmpty(obj.dirScripts)) { // plural
            this.dirScript = resolvePath(obj.dirScripts);
        }
        if (isStringNotEmpty(obj.dirResult)) { // singular
            this.dirResult = resolvePath(obj.dirResult);
        }
        else if (isStringNotEmpty(obj.dirResults)) { // plural
            this.dirResult = resolvePath(obj.dirResults);
        }
        else if (isStringNotEmpty(obj.dirOutput)) { // alternative
            this.dirResult = resolvePath(obj.dirOutput);
        }
        // FILES
        if (isStringNotEmpty(obj.config)) {
            this.config = resolvePath(obj.config);
        }
        if (isStringNotEmpty(obj.file)) {
            this.file = obj.file.trim().split(PARAM_SEPARATOR);
        }
        else if (isStringNotEmpty(obj.files)) { // alternative
            this.file = obj.files.trim().split(PARAM_SEPARATOR);
        }
        if (isStringNotEmpty(obj.ignore)) {
            this.ignore = obj.ignore.trim().split(PARAM_SEPARATOR);
        }
        if (isStringNotEmpty(obj.scriptFile)) {
            this.scriptFile = obj.scriptFile.trim().split(PARAM_SEPARATOR);
        }
        else if (isStringNotEmpty(obj.scriptFiles)) { // alternative
            this.scriptFile = obj.scriptFiles.trim().split(PARAM_SEPARATOR);
        }
        if (isStringNotEmpty(obj.scriptGrep)) {
            this.scriptGrep = obj.scriptGrep.trim();
        }
        if (true === obj.headless) {
            this.headless = true;
        }
        this.instances = !isNaN(obj.instances) && obj.instances > 1
            ? obj.instances : undefined;
        // EXTENSIONS, ENCODING, SEPARATORS, ETC.
        if (isStringNotEmpty(obj.extensionFeature)) {
            this.extensionFeature = obj.extensionFeature;
        }
        else if (isStringNotEmpty(obj.extFeature)) { // alternative
            this.extensionFeature = obj.extFeature;
        }
        if (isStringNotEmpty(obj.extensionTestCase)) {
            this.extensionTestCase = obj.extensionTestCase;
        }
        else if (isStringNotEmpty(obj.extTestCase)) { // alternative
            this.extensionTestCase = obj.extTestCase;
        }
        this.extensions = [this.extensionFeature, this.extensionTestCase];
        if (TypeChecking_1.isString(obj.lineBreaker)) {
            this.lineBreaker = obj.lineBreaker;
        }
        else if (TypeChecking_1.isString(obj.lineBreak)) { // similar
            this.lineBreaker = obj.lineBreak;
        }
        if (isStringNotEmpty(obj.encoding)) {
            this.encoding = obj.encoding.trim().toLowerCase();
        }
        // LANGUAGE
        if (isStringNotEmpty(obj.language)) {
            this.language = obj.language.trim().toLowerCase();
        }
        this.languageList = TypeChecking_1.isDefined(obj.languageList);
        // PLUG-IN
        // console.log( obj );
        if (isStringNotEmpty(obj.plugin)) {
            this.plugin = obj.plugin.trim().toLowerCase();
        }
        this.pluginList = TypeChecking_1.isDefined(obj.pluginList);
        this.pluginAbout = TypeChecking_1.isDefined(obj.pluginAbout) || TypeChecking_1.isDefined(obj.pluginInfo);
        this.pluginInstall = TypeChecking_1.isDefined(obj.pluginInstall) && !(false === obj.pluginInstall);
        this.pluginUninstall = TypeChecking_1.isDefined(obj.pluginUninstall);
        this.pluginServe = TypeChecking_1.isDefined(obj.pluginServe);
        if (isStringNotEmpty(obj.pluginAbout)) {
            this.plugin = obj.pluginAbout.trim().toLowerCase();
        }
        else if (isStringNotEmpty(obj.pluginInfo)) { // Same as plugin about
            this.plugin = obj.pluginInfo.trim().toLowerCase();
        }
        else if (isStringNotEmpty(obj.pluginInstall)) {
            this.plugin = obj.pluginInstall.trim().toLowerCase();
        }
        else if (isStringNotEmpty(obj.pluginUninstall)) {
            this.plugin = obj.pluginUninstall.trim().toLowerCase();
        }
        else if (isStringNotEmpty(obj.pluginServe)) {
            this.plugin = obj.pluginServe.trim().toLowerCase();
        }
        // if ( isStringNotEmpty( obj.pluginOption ) ) {
        //     this.pluginOption = obj.pluginOption;
        // } else if ( isStringNotEmpty( obj.pluginOptions ) ) { // alternative
        //     this.pluginOption = obj.pluginOptions;
        // }
        if (isStringNotEmpty(obj.target)) {
            this.target = obj.target;
        }
        else if (isStringNotEmpty(obj.targets)) { // alternative
            this.target = obj.targets;
        }
        // DATABASE
        this.dbList = TypeChecking_1.isDefined(obj.dbList);
        if (isStringNotEmpty(obj.dbInstall)) {
            this.dbInstall = obj.dbInstall.trim().toLowerCase();
        }
        else if (isStringNotEmpty(obj.dbUninstall)) {
            this.dbUninstall = obj.dbUninstall.trim().toLowerCase();
        }
        // LOCALE
        this.localeList = TypeChecking_1.isDefined(obj.localeList);
        // PROCESSING
        if (TypeChecking_1.isDefined(obj.init)) {
            this.init = true == obj.init;
        }
        if (TypeChecking_1.isDefined(obj.saveConfig)) {
            this.saveConfig = true == obj.saveConfig;
        }
        const ast = isStringNotEmpty(obj.ast)
            ? obj.ast
            : (TypeChecking_1.isDefined(obj.ast) ? this.defaults.AST_FILE : undefined);
        this.ast = ast;
        if (TypeChecking_1.isDefined(obj.verbose)) {
            this.verbose = true == obj.verbose;
        }
        this.stopOnTheFirstError = true === obj.failFast || true === obj.stopOnTheFirstError;
        // const justSpec: boolean = isDefined( obj.justSpec ) || isDefined( obj.justSpecification );
        const justTestCase = TypeChecking_1.isDefined(obj.justTestCase) || TypeChecking_1.isDefined(obj.justTestCases);
        const justScript = TypeChecking_1.isDefined(obj.justScript) || TypeChecking_1.isDefined(obj.justScripts);
        const justRun = TypeChecking_1.isDefined(obj.justRun);
        const justResult = TypeChecking_1.isDefined(obj.justResult) || TypeChecking_1.isDefined(obj.justResults);
        // Compare to false is important because meow transforms no-xxx to xxx === false
        // const noSpec: boolean = false === obj.spec ||
        //     false === obj.specification;
        const noTestCase = false === obj.generateTestCase ||
            false === obj.testCase ||
            false === obj.testCases ||
            false === obj.testcase ||
            false === obj.testcases;
        const noScript = false === obj.generateScript ||
            false === obj.script ||
            false === obj.scripts ||
            false === obj.testScript ||
            false === obj.testScripts ||
            false == obj.testscript ||
            false == obj.testscripts;
        const noRun = false == obj.executeScript ||
            false === obj.run ||
            false === obj.execute;
        const noResult = false === obj.analyzeResult ||
            false === obj.result ||
            false === obj.results;
        // Adjust flags
        this.generateTestCase = (!noTestCase || justTestCase)
            && (!justScript && !justRun && !justResult);
        this.generateScript = (!noScript || justScript)
            && (!justRun && !justResult);
        this.executeScript = (!noRun || justRun)
            && (!justResult);
        this.analyzeResult = (!noResult || justResult)
            && (!justRun);
        this.compileSpecification = this.generateTestCase || this.generateScript;
        // CONTENT GENERATION
        if (TypeChecking_1.isString(obj.caseUi)) {
            this.caseUi = obj.caseUi;
        }
        if (TypeChecking_1.isString(obj.caseMethod)) {
            this.caseMethod = obj.caseMethod;
        }
        this.tcSuppressHeader = TypeChecking_1.isDefined(obj.tcSuppressHeader);
        if (TypeChecking_1.isString(obj.tcIndenter)) {
            this.tcIndenter = obj.tcIndenter;
        }
        // RANDOMIC GENERATION
        if (TypeChecking_1.isString(obj.seed) || TypeChecking_1.isNumber(obj.seed)) {
            this.seed = String(obj.seed);
        }
        // if ( isNumber( flags.randomValid ) ) {
        //     this.randomValid = parseInt( flags.randomValid );
        // }
        // if ( isNumber( flags.randomInvalid ) ) {
        //     this.randomInvalid = parseInt( flags.randomInvalid );
        // }
        if (TypeChecking_1.isNumber(obj.randomMinStringSize)) {
            this.randomMinStringSize = parseInt(obj.randomMinStringSize);
        }
        if (TypeChecking_1.isNumber(obj.randomMaxStringSize)) {
            this.randomMaxStringSize = parseInt(obj.randomMaxStringSize);
        }
        if (TypeChecking_1.isNumber(obj.randomTries)) {
            this.randomTriesToInvalidValue = obj.randomTries;
        }
        // SPECIFICATION SELECTION
        if (TypeChecking_1.isNumber(obj.importance)) {
            this.importance = parseInt(obj.importance);
        }
        if (TypeChecking_1.isNumber(obj.selMinFeature)) {
            this.selMinFeature = parseInt(obj.selMinFeature);
        }
        if (TypeChecking_1.isNumber(obj.selMaxFeature)) {
            this.selMaxFeature = parseInt(obj.selMaxFeature);
        }
        if (TypeChecking_1.isNumber(obj.selMinScenario)) {
            this.selMinScenario = parseInt(obj.selMinScenario);
        }
        if (TypeChecking_1.isNumber(obj.selMaxScenario)) {
            this.selMaxScenario = parseInt(obj.selMaxScenario);
        }
        if (TypeChecking_1.isString(obj.selFilter)) {
            this.selFilter = obj.selFilter;
        }
        // TEST SCENARIO SELECTION AND COMBINATION STRATEGIES
        if (TypeChecking_1.isString(obj.combVariant)
            && enumUtil.isValue(CombinationOptions_1.VariantSelectionOptions, obj.combVariant)) {
            this.combVariant = obj.combVariant;
        }
        if (TypeChecking_1.isString(obj.combState)
            && enumUtil.isValue(CombinationOptions_1.CombinationOptions, obj.combState)) {
            this.combState = obj.combState;
        }
        // SELECTION AND COMBINATION STRATEGIES FOR DATA TEST CASES
        if (TypeChecking_1.isNumber(obj.combInvalid) && Number(obj.combInvalid) >= 0) {
            this.combInvalid = parseInt(obj.combInvalid);
        }
        else if (TypeChecking_1.isString(obj.combInvalid)) {
            this.combInvalid = obj.combInvalid;
        }
        if (TypeChecking_1.isString(obj.combData)
            && enumUtil.isValue(CombinationOptions_1.CombinationOptions, obj.combData)) {
            this.combData = obj.combData;
        }
        // TEST SCRIPT FILTERING
        if (TypeChecking_1.isNumber(obj.runMinFeature)) {
            this.runMinFeature = parseInt(obj.runMinFeature);
        }
        if (TypeChecking_1.isNumber(obj.runMaxFeature)) {
            this.runMaxFeature = parseInt(obj.runMaxFeature);
        }
        if (TypeChecking_1.isNumber(obj.runMinScenario)) {
            this.runMinScenario = parseInt(obj.runMinScenario);
        }
        if (TypeChecking_1.isNumber(obj.runMaxScenario)) {
            this.runMaxScenario = parseInt(obj.runMaxScenario);
        }
        if (TypeChecking_1.isString(obj.runFilter)) {
            this.runFilter = obj.runFilter;
        }
        // INFO
        this.help = TypeChecking_1.isDefined(obj.help);
        this.about = TypeChecking_1.isDefined(obj.about);
        this.version = TypeChecking_1.isDefined(obj.version);
        this.newer = TypeChecking_1.isDefined(obj.newer);
        this.debug = TypeChecking_1.isDefined(obj.debug);
        this.fixInconsistences();
    }
    /**
     * Fix inconsistences
     */
    fixInconsistences() {
        // LANGUAGE
        this.languageList = this.languageList && !this.help; // Help flag takes precedence over other flags
        // PLUG-IN
        this.pluginList = this.pluginList && !this.help; // Help flag takes precedence over other flags
        this.pluginAbout = this.pluginAbout && !this.pluginList;
        this.pluginInstall = this.pluginInstall && !this.pluginAbout && !this.pluginList;
        this.pluginUninstall = this.pluginUninstall && !this.pluginAbout && !this.pluginList;
        this.pluginServe = this.pluginServe && !this.pluginAbout && !this.pluginList;
        // RANDOMIC GENERATION
        // if ( this.randomValid < 0 ) {
        //     this.randomValid = 0;
        // }
        // if ( this.randomInvalid < 0 ) {
        //     this.randomInvalid = 0;
        // }
        // SPECIFICATION SELECTION
        if (this.selMinFeature < 0) {
            this.selMinFeature = 0;
        }
        if (this.selMaxFeature < 0) {
            this.selMaxFeature = 0;
        }
        if (this.selMinScenario < 0) {
            this.selMinScenario = 0;
        }
        if (this.selMaxScenario < 0) {
            this.selMaxScenario = 0;
        }
        // TEST SCRIPT FILTERING
        if (this.runMinFeature < 0) {
            this.runMinFeature = 0;
        }
        if (this.runMaxFeature < 0) {
            this.runMaxFeature = 0;
        }
        if (this.runMinScenario < 0) {
            this.runMinScenario = 0;
        }
        if (this.runMaxScenario < 0) {
            this.runMaxScenario = 0;
        }
        // INFO
        // - Help flag takes precedence over other flags
        this.about = this.about && !this.help;
        this.version = this.version && !this.help;
        this.newer = this.newer && !this.help;
    }
    /**
     * Returns an object that can be saved.
     */
    export() {
        const newOptions = new Options(this.appPath, this.processPath);
        let obj = {};
        let paramsToIgnore = this.PARAMS_TO_IGNORE.slice(0); // copy
        // Individual cases
        if (this.isGeneratedSeed) {
            paramsToIgnore.push('seed');
        }
        // Convert
        for (let p in this) {
            let pType = typeof p;
            if ('function' === pType) {
                // console.log( 'function', p );
                continue;
            }
            if (paramsToIgnore.indexOf(p) >= 0) {
                // console.log( 'ignored property', p );
                continue;
            }
            // Equal arrays
            if (Array.isArray(this[p])
                && JSON.stringify(this[p]) === JSON.stringify(newOptions[p])) {
                // console.log( 'equal arrays', p );
                continue;
            }
            // Same values? Ignore
            if (this[p] === newOptions[p]) {
                // console.log( 'same values', p );
                continue;
            }
            obj[p.toString()] = this[p];
            // console.log( 'copied', p );
        }
        return obj;
    }
}
exports.Options = Options;
