import * as enumUtil from 'enum-util';
import { resolve, isAbsolute } from 'path';
import { isDefined, isNumber, isString } from '../util/TypeChecking';
import { CaseType } from '../util/CaseType';
import { Defaults } from './Defaults';
import { CombinationOptions, VariantSelectionOptions } from "./CombinationOptions";
import { ValueTypeDetector } from '../util/ValueTypeDetector';


/**
 * Application options
 *
 * @author Thiago Delgado Pinto
 */
export class Options {

    // Default values - not updatable
    public readonly defaults: Defaults = new Defaults();

    /**
     * Parameters that should not be saved. The other parameters should only
     * be saved if they are different from the default ones (new Options()).
     */
    private readonly PARAMS_TO_IGNORE = [

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
    public recursive: boolean = true;
    /** Directory with specification files */
    public directory: string = this.defaults.DIRECTORY;
    /** Output directory for test script files */
    public dirScript: string = this.defaults.DIR_SCRIPT;
    /** Output directory of test script results */
    public dirResult: string = this.defaults.DIR_RESULT;

    // FILES

    /** Configuration file path */
    public config: string = this.defaults.CONFIG;
    /** Files to ignore, from the given directory */
    public ignore: string[] = [];
    /** Files to consider, instead of the given directory */
    public file: string[] = [];
    /** Script files to execute */
    public scriptFile: string[] = [];
    /** Send an expression to filter the test scripts to run. Some plug-ins may not support it. */
    public scriptGrep: string = null;

    // FILE-RELATED OPTIONS

    /** Default encoding */
    public encoding: string = this.defaults.ENCODING;
    public extensions: string[] = this.defaults.EXTENSIONS; // extensions to search // TO-DO: integrate this with extensionFeature and extensionTestCase
    /** Extension for feature files */
    public extensionFeature: string = this.defaults.EXTENSION_FEATURE;
    /** Extension for test case files */
    public extensionTestCase: string = this.defaults.EXTENSION_TEST_CASE;
    /** Characters used to break lines in text files */
    public lineBreaker: string = this.defaults.LINE_BREAKER;

    // Language
    public language: string = this.defaults.LANGUAGE; // change default language
    public languageList: boolean = false; // show available languages

    // PLUGIN

    /** Plug-in (name) to use */
    public plugin: string = null;
    /** Show available plug-ins */
    public pluginList: boolean = false;
    /** Show information about a plug-in */
    public pluginAbout: boolean = false;
    /** Install an available plug-in */
    public pluginInstall: boolean = false;
    /** Uninstall an available plug-in */
    public pluginUninstall: boolean = false;
    /** Start the test server of a plug-in */
    public pluginServe: boolean = false;

    /**
     * CLI options to be repassed to the plug-in.
     * This could be removed in a near future since plug-ins can be executed
     * via code by the plug-ins.
     */
    // public pluginOption: string = null;

    /** Target browsers or platforms */
    public target: string = null;
    /** Headless test script execution. Browsers only. Some plug-ins may not support it. */
    public headless?: boolean = null;
    /** Parallel instances to run. Some plug-ins may not support it. */
    public instances?: number;

    // PROCESSING

    /** Whether it is wanted to execute a guided configuration */
    public init: boolean = false;
    /** Whether it is desired to save/overwrite a configuration file */
    public saveConfig: boolean = false;
    /** Generates an AST file instead of executing anything else */
    public ast: string = null;
    /** Verbose output */
    public verbose: boolean = false;
    /** Stop on the first error */
    public stopOnTheFirstError: boolean = false;
    /** Whether it is desired to compile the specification */
    public compileSpecification: boolean = true;
    /** Whether it is desired to generate test case files */
    public generateTestCase: boolean = true;
    /** Whether it is desired to generate test script files */
    public generateScript: boolean = true;
    /** Whether it is desired to execute test script files */
    public executeScript: boolean = true;
    /** Whether it is desired to analyze test script results */
    public analyzeResult: boolean = true;

    // CONTENT GENERATION

    /**
     * String case used for UI Elements' ids when an id is not defined.
     *
     * @see CaseType
     */
    public caseUi: string = this.defaults.CASE_UI;

    /**
     * String case used for test scripts' methods.
     *
     * @see CaseType
     */
    public caseMethod: string = this.defaults.CASE_METHOD;

    /** Whether it is desired to suppress header comments in test case files */
    public tcSuppressHeader: boolean = false;

    /** Character used as indenter for test case files */
    public tcIndenter: string = this.defaults.TC_INDENTER;


    // RANDOMIC GENERATION

    /** Seed */
    public seed: string = null;

    /** Indicates whether the seed was generated by Concordia or not */
    public isGeneratedSeed: boolean = false;

    /**
     * Real seed to use. If the seed is less than 64 characters, the real seed
     * should be its SHA-512 hash.
     */
    public realSeed: string = null;

    // /** Number of test cases with valid random values */
    // public randomValid: number = 1;
    // /** Number of test cases with invalid random values */
    // public randomInvalid: number = 1;
    /** Minimum size for random strings */
    public randomMinStringSize: number = this.defaults.RANDOM_MIN_STRING_SIZE;
    /** Maximum size for random strings */
    public randomMaxStringSize: number = this.defaults.RANDOM_MAX_STRING_SIZE;
    /** How many tries it will make to generate random values that are not in a set */
    public randomTriesToInvalidValue: number = this.defaults.RANDOM_TRIES_TO_INVALID_VALUE;

    // SPECIFICATION SELECTION

    /** Default importance value */
    public importance: number = this.defaults.IMPORTANCE;
    /** Minimum feature importance */
    public selMinFeature: number = 0;
    /** Maximum feature importance */
    public selMaxFeature: number = 0;
    /** Minimum scenario importance */
    public selMinScenario: number = 0;
    /** Maximum scenario importance */
    public selMaxScenario: number = 0;
    /** Filter by tags
     * @see https://github.com/telefonicaid/tartare#tags-and-filters */
    public selFilter: string = '';

    // TEST SCENARIO SELECTION AND COMBINATION STRATEGIES

    /** @see VariantSelectionOptions */
    public combVariant: string = this.defaults.VARIANT_SELECTION;

    /** @see StateCombinationOptions */
    public combState: string = this.defaults.STATE_COMBINATION;

    // SELECTION AND COMBINATION STRATEGIES FOR DATA TEST CASES

    /** @see Defaults */
    public combInvalid: number | string = this.defaults.INVALID_DATA_TEST_CASES_AT_A_TIME;
    /** @see DataTestCaseCombinationOptions */
    public combData: string = this.defaults.DATA_TEST_CASE_COMBINATION;

    // Test script filtering
    public runMinFeature: number = 0; // minimum feature importance
    public runMaxFeature: number = 0; // maximum feature importance
    public runMinScenario: number = 0; // minimum scenario importance
    public runMaxScenario: number = 0; // maximum scenario importance
    public runFilter: string = ''; // filter by tags @see https://github.com/telefonicaid/tartare#tags-and-filters

    // Info
    public help: boolean = false; // show help
    public about: boolean = false; // show about
    public version: boolean = false; // show version
    public newer: boolean = false; // check for version updates
    public debug: boolean = false; // debug mode

    // Internal
    public pluginDir: string = this.defaults.DIR_PLUGIN;
    public languageDir: string = this.defaults.DIR_LANGUAGE;


    constructor(
        public appPath: string = __dirname,
        public processPath: string = process.cwd()
    ) {
        // console.log( 'App path (main.js)', appPath, 'Process path', processPath );

        // @see https://github.com/zeit/pkg#assets
        // const isSnapshot = 0 === appPath.indexOf( '/snapshot' )
        //     || 0 === appPath.indexOf( 'C:\\snapshot' );

        // if ( isSnapshot ) {
        //     appPath = processPath; // Both plugins and languages are loaded dynamically
        // }

        // Concordia directories
        this.pluginDir = resolve( appPath, this.defaults.DIR_PLUGIN );
        this.languageDir = resolve( appPath, this.defaults.DIR_LANGUAGE );

        // Use-defined directories
        this.directory = resolve( processPath, this.defaults.DIRECTORY );
        this.dirScript = resolve( processPath, this.defaults.DIR_SCRIPT );
        this.dirResult = resolve( processPath, this.defaults.DIR_RESULT );

        // Use-defined files
        this.config = resolve( processPath, this.defaults.CONFIG );
    }


    public shouldSeeHelp(): boolean {
        return this.help
            && ! this.about
            && ! ( this.someInfoOption() )
            ;
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

    public hasAnySpecificationFilter(): boolean {
        return this.hasFeatureFilter()
            || this.hasScenarioFilter()
            || this.hasTagFilter();
    }

    public hasFeatureFilter(): boolean {
        return this.selMinFeature > 0 || this.selMaxFeature > 0;
    }

    public hasScenarioFilter(): boolean {
        return this.selMinScenario > 0 || this.selMaxScenario > 0;
    }

    public hasTagFilter(): boolean {
        return this.selFilter != '';
    }

    public someInfoOption(): boolean {
        return this.help || this.about || this.version;
    }

    public somePluginOption(): boolean {
        // `pluginOptions` is ignored
        return this.pluginList
            || this.pluginAbout
            || this.pluginInstall
            || this.pluginUninstall
            || this.pluginServe;
    }

    public someOptionThatRequiresAPlugin(): boolean {
        return this.generateScript || this.executeScript || this.analyzeResult;
    }

    public hasPluginName(): boolean {
        return this.plugin !== null && this.plugin !== undefined;
    }

    public typedCaseUI(): CaseType {
        if ( enumUtil.isValue( CaseType, this.caseUi ) ) {
            return this.caseUi;
        }
        if ( enumUtil.isValue( CaseType, this.defaults.CASE_UI ) ) {
            return this.defaults.CASE_UI;
        }
        return CaseType.CAMEL;
    }

    public typedVariantSelection(): VariantSelectionOptions {
        if ( enumUtil.isValue( VariantSelectionOptions, this.combVariant ) ) {
            return this.combVariant;
        }
        if ( enumUtil.isValue( VariantSelectionOptions, this.defaults.VARIANT_SELECTION ) ) {
            return this.defaults.VARIANT_SELECTION;
        }
        return VariantSelectionOptions.SINGLE_RANDOM;
    }

    public typedStateCombination(): CombinationOptions {
        return this.typedCombinationFor( this.combState, this.defaults.STATE_COMBINATION );
    }

    public typedDataCombination(): CombinationOptions {
        return this.typedCombinationFor( this.combData, this.defaults.DATA_TEST_CASE_COMBINATION );
    }

    private typedCombinationFor( value: string, defaultValue: string ): CombinationOptions {
        if ( enumUtil.isValue( CombinationOptions, value ) ) {
            return value;
        }
        if ( enumUtil.isValue( CombinationOptions, defaultValue ) ) {
            return defaultValue;
        }
        return CombinationOptions.SHUFFLED_ONE_WISE;
    }

    /**
     * Set attributes from a given object.
     *
     * @param obj Object
     */
    import( obj: any ): void {

        const PARAM_SEPARATOR: string = ',';

        // Helper functions

        const isStringNotEmpty = text => isString( text ) && text.trim() != '';

        const resolvePath = p => isAbsolute( p ) ? p : resolve( this.processPath, p );

        // DIRECTORIES

        this.recursive = obj.recursive !== false;

        if ( isStringNotEmpty( obj.directory ) ) {
            this.directory = resolvePath( obj.directory );
        }

        if ( isStringNotEmpty( obj.dirScript ) ) { // singular
            this.dirScript = resolvePath( obj.dirScript );
        } else if ( isStringNotEmpty( obj.dirScripts ) ) { // plural
            this.dirScript = resolvePath( obj.dirScripts );
        }

        if ( isStringNotEmpty( obj.dirResult ) ) { // singular
            this.dirResult = resolvePath( obj.dirResult );
        } else if ( isStringNotEmpty( obj.dirResults ) ) { // plural
            this.dirResult = resolvePath( obj.dirResults );
        } else if ( isStringNotEmpty( obj.dirOutput ) ) { // alternative
            this.dirResult = resolvePath( obj.dirOutput );
        }

        // FILES

        if ( isStringNotEmpty( obj.config ) ) {
            this.config = resolvePath( obj.config );
        }

        if ( isStringNotEmpty( obj.file ) ) {
            this.file = obj.file.trim().split( PARAM_SEPARATOR );
        } else if ( isStringNotEmpty( obj.files ) ) { // alternative
            this.file = obj.files.trim().split( PARAM_SEPARATOR );
        }

        if ( isStringNotEmpty( obj.ignore ) ) {
            this.ignore = obj.ignore.trim().split( PARAM_SEPARATOR );
        }

        if ( isStringNotEmpty( obj.scriptFile ) ) {
            this.scriptFile = obj.scriptFile.trim().split( PARAM_SEPARATOR );
        } else if ( isStringNotEmpty( obj.scriptFiles ) ) { // alternative
            this.scriptFile = obj.scriptFiles.trim().split( PARAM_SEPARATOR );
        }

        if ( isStringNotEmpty( obj.scriptGrep ) ) {
            this.scriptGrep = obj.scriptGrep.trim();
        }

        if ( true === obj.headless ) {
            this.headless = true;
        }

        this.instances = ! isNaN( obj.instances ) && obj.instances > 1
            ? obj.instances : undefined;

        // EXTENSIONS, ENCODING, SEPARATORS, ETC.

        if ( isStringNotEmpty( obj.extensionFeature ) ) {
            this.extensionFeature = obj.extensionFeature;
        } else if ( isStringNotEmpty( obj.extFeature ) ) { // alternative
            this.extensionFeature = obj.extFeature;
        }

        if ( isStringNotEmpty( obj.extensionTestCase ) ) {
            this.extensionTestCase = obj.extensionTestCase;
        } else if ( isStringNotEmpty( obj.extTestCase ) ) { // alternative
            this.extensionTestCase = obj.extTestCase;
        }

        this.extensions = [ this.extensionFeature, this.extensionTestCase ];

        if ( isString( obj.lineBreaker ) ) {
            this.lineBreaker = obj.lineBreaker;
        } else if ( isString( obj.lineBreak ) ) { // similar
            this.lineBreaker = obj.lineBreak;
        }

        if ( isStringNotEmpty( obj.encoding ) ) {
            this.encoding = obj.encoding.trim().toLowerCase();
        }

        // LANGUAGE

        if ( isStringNotEmpty( obj.language )  ) {
            this.language = obj.language.trim().toLowerCase();
        }

        this.languageList = isDefined( obj.languageList );

        // PLUG-IN

        // console.log( obj );

        if ( isStringNotEmpty( obj.plugin ) ) {
            this.plugin = obj.plugin.trim().toLowerCase();
        }

        this.pluginList = isDefined( obj.pluginList );
        this.pluginAbout = isDefined( obj.pluginAbout ) || isDefined( obj.pluginInfo );
        this.pluginInstall = isDefined( obj.pluginInstall ) && ! ( false === obj.pluginInstall );
        this.pluginUninstall = isDefined( obj.pluginUninstall );
        this.pluginServe = isDefined( obj.pluginServe );

        if ( isStringNotEmpty( obj.pluginAbout ) ) {
            this.plugin = obj.pluginAbout.trim().toLowerCase();
        } else if ( isStringNotEmpty( obj.pluginInfo ) ) { // Same as plugin about
            this.plugin = obj.pluginInfo.trim().toLowerCase();
        } else if ( isStringNotEmpty( obj.pluginInstall ) ) {
            this.plugin = obj.pluginInstall.trim().toLowerCase();
        } else if ( isStringNotEmpty( obj.pluginUninstall ) ) {
            this.plugin = obj.pluginUninstall.trim().toLowerCase();
        } else if ( isStringNotEmpty( obj.pluginServe ) ) {
            this.plugin = obj.pluginServe.trim().toLowerCase();
        }

        // if ( isStringNotEmpty( obj.pluginOption ) ) {
        //     this.pluginOption = obj.pluginOption;
        // } else if ( isStringNotEmpty( obj.pluginOptions ) ) { // alternative
        //     this.pluginOption = obj.pluginOptions;
        // }

        if ( isStringNotEmpty( obj.target ) ) {
            this.target = obj.target;
        } else if ( isStringNotEmpty( obj.targets ) ) { // alternative
            this.target = obj.targets;
        }

        // PROCESSING

        if ( isDefined( obj.init ) ) {
            this.init = true == obj.init;
        }

        if ( isDefined( obj.saveConfig ) ) {
            this.saveConfig = true == obj.saveConfig;
        }

        const ast = isStringNotEmpty( obj.ast )
            ? obj.ast
            : ( isDefined( obj.ast ) ? this.defaults.AST_FILE : undefined );

        this.ast = ast;

        if ( isDefined( obj.verbose ) ) {
            this.verbose = true == obj.verbose;
        }

        this.stopOnTheFirstError = true === obj.failFast || true === obj.stopOnTheFirstError;

        // const justSpec: boolean = isDefined( obj.justSpec ) || isDefined( obj.justSpecification );
        const justTestCase: boolean = isDefined( obj.justTestCase ) || isDefined( obj.justTestCases );
        const justScript: boolean = isDefined( obj.justScript ) || isDefined( obj.justScripts );
        const justRun: boolean = isDefined( obj.justRun );
        const justResult: boolean = isDefined( obj.justResult ) || isDefined( obj.justResults );

        // Compare to false is important because meow transforms no-xxx to xxx === false

        // const noSpec: boolean = false === obj.spec ||
        //     false === obj.specification;

        const noTestCase: boolean = false === obj.generateTestCase ||
            false === obj.testCase ||
            false === obj.testCases ||
            false === obj.testcase ||
            false === obj.testcases;

        const noScript: boolean = false === obj.generateScript ||
            false === obj.script ||
            false === obj.scripts ||
            false === obj.testScript ||
            false === obj.testScripts ||
            false == obj.testscript ||
            false == obj.testscripts;

        const noRun: boolean = false == obj.executeScript ||
            false === obj.run ||
            false === obj.execute;

        const noResult: boolean = false === obj.analyzeResult ||
            false === obj.result ||
            false === obj.results;

        // Adjust flags

        this.generateTestCase = ( ! noTestCase || justTestCase )
            && ( ! justScript && ! justRun && ! justResult );

        this.generateScript = ( ! noScript || justScript )
            && ( ! justRun && ! justResult );

        this.executeScript = ( ! noRun || justRun )
            && ( ! justResult );

        this.analyzeResult = ( ! noResult || justResult )
            && ( ! justRun );

        this.compileSpecification = this.generateTestCase || this.generateScript;


        // CONTENT GENERATION

        if ( isString( obj.caseUi ) ) {
            this.caseUi = obj.caseUi;
        }
        if ( isString( obj.caseMethod ) ) {
            this.caseMethod = obj.caseMethod;
        }

        this.tcSuppressHeader = isDefined( obj.tcSuppressHeader );

        if ( isString( obj.tcIndenter ) ) {
            this.tcIndenter = obj.tcIndenter;
        }

        // RANDOMIC GENERATION

        if ( isString( obj.seed ) || isNumber( obj.seed ) ) {
            this.seed = String( obj.seed );
        }

        // if ( isNumber( flags.randomValid ) ) {
        //     this.randomValid = parseInt( flags.randomValid );
        // }
        // if ( isNumber( flags.randomInvalid ) ) {
        //     this.randomInvalid = parseInt( flags.randomInvalid );
        // }

        if ( isNumber( obj.randomMinStringSize ) ) {
            this.randomMinStringSize = parseInt( obj.randomMinStringSize );
        }

        if ( isNumber( obj.randomMaxStringSize ) ) {
            this.randomMaxStringSize = parseInt( obj.randomMaxStringSize );
        }

        if ( isNumber( obj.randomTries ) ) {
            this.randomTriesToInvalidValue = obj.randomTries;
        }

        // SPECIFICATION SELECTION

        if ( isNumber( obj.importance ) ) {
            this.importance = parseInt( obj.importance );
        }
        if ( isNumber( obj.selMinFeature ) ) {
            this.selMinFeature = parseInt( obj.selMinFeature );
        }
        if ( isNumber( obj.selMaxFeature ) ) {
            this.selMaxFeature = parseInt( obj.selMaxFeature );
        }
        if ( isNumber( obj.selMinScenario ) ) {
            this.selMinScenario = parseInt( obj.selMinScenario );
        }
        if ( isNumber( obj.selMaxScenario ) ) {
            this.selMaxScenario = parseInt( obj.selMaxScenario );
        }
        if ( isString( obj.selFilter ) ) {
            this.selFilter = obj.selFilter;
        }

        // TEST SCENARIO SELECTION AND COMBINATION STRATEGIES

        if ( isString( obj.combVariant )
            && enumUtil.isValue( VariantSelectionOptions, obj.combVariant ) ) {
            this.combVariant = obj.combVariant;
        }
        if ( isString( obj.combState )
            && enumUtil.isValue( CombinationOptions, obj.combState ) ) {
            this.combState = obj.combState;
        }

        // SELECTION AND COMBINATION STRATEGIES FOR DATA TEST CASES

        if ( isNumber( obj.combInvalid ) && Number( obj.combInvalid ) >= 0 ) {
            this.combInvalid = parseInt( obj.combInvalid );
        } else if ( isString( obj.combInvalid ) ) {
            this.combInvalid = obj.combInvalid;
        }

        if ( isString( obj.combData )
            && enumUtil.isValue( CombinationOptions, obj.combData ) ) {
            this.combData = obj.combData;
        }

        // TEST SCRIPT FILTERING

        if ( isNumber( obj.runMinFeature ) ) {
            this.runMinFeature = parseInt( obj.runMinFeature );
        }
        if ( isNumber( obj.runMaxFeature ) ) {
            this.runMaxFeature = parseInt( obj.runMaxFeature );
        }
        if ( isNumber( obj.runMinScenario ) ) {
            this.runMinScenario = parseInt( obj.runMinScenario );
        }
        if ( isNumber( obj.runMaxScenario ) ) {
            this.runMaxScenario = parseInt( obj.runMaxScenario );
        }
        if ( isString( obj.runFilter ) ) {
            this.runFilter = obj.runFilter;
        }

        // INFO

        this.help = isDefined( obj.help );
        this.about = isDefined( obj.about );
        this.version = isDefined( obj.version );
        this.newer = isDefined( obj.newer );
        this.debug = isDefined( obj.debug );

        this.fixInconsistences();
    }


    /**
     * Fix inconsistences
     */
    private fixInconsistences(): void {

        // LANGUAGE
        this.languageList = this.languageList && ! this.help; // Help flag takes precedence over other flags

        // PLUG-IN
        this.pluginList = this.pluginList && ! this.help; // Help flag takes precedence over other flags
        this.pluginAbout = this.pluginAbout && ! this.pluginList;
        this.pluginInstall = this.pluginInstall && ! this.pluginAbout && ! this.pluginList;
        this.pluginUninstall = this.pluginUninstall && ! this.pluginAbout && ! this.pluginList;
        this.pluginServe = this.pluginServe && ! this.pluginAbout && ! this.pluginList;

        // RANDOMIC GENERATION
        // if ( this.randomValid < 0 ) {
        //     this.randomValid = 0;
        // }
        // if ( this.randomInvalid < 0 ) {
        //     this.randomInvalid = 0;
        // }

        // SPECIFICATION SELECTION
        if ( this.selMinFeature < 0 ) {
            this.selMinFeature = 0;
        }
        if ( this.selMaxFeature < 0 ) {
            this.selMaxFeature = 0;
        }
        if ( this.selMinScenario < 0 ) {
            this.selMinScenario = 0;
        }
        if ( this.selMaxScenario < 0 ) {
            this.selMaxScenario = 0;
        }

        // TEST SCRIPT FILTERING
        if ( this.runMinFeature < 0 ) {
            this.runMinFeature = 0;
        }
        if ( this.runMaxFeature < 0 ) {
            this.runMaxFeature = 0;
        }
        if ( this.runMinScenario < 0 ) {
            this.runMinScenario = 0;
        }
        if ( this.runMaxScenario < 0 ) {
            this.runMaxScenario = 0;
        }

        // INFO
        // - Help flag takes precedence over other flags
        this.about = this.about && ! this.help;
        this.version = this.version && ! this.help;
        this.newer = this.newer && ! this.help;
    }

    /**
     * Returns an object that can be saved.
     */
    export(): any {
        const newOptions = new Options( this.appPath, this.processPath );
        let obj = {};
        let paramsToIgnore = this.PARAMS_TO_IGNORE.slice( 0 ); // copy
        // Individual cases
        if ( this.isGeneratedSeed ) {
            paramsToIgnore.push( 'seed' );
        }
        // Convert
        for ( let p in this ) {
            let pType = typeof p;
            if ( 'function' === pType ) {
                // console.log( 'function', p );
                continue;
            }
            if ( paramsToIgnore.indexOf( p ) >= 0 ) {
                // console.log( 'ignored property', p );
                continue;
            }
            // Equal arrays
            if ( Array.isArray( this[ p ] )
                && JSON.stringify( this[ p ] ) === JSON.stringify( ( newOptions[ p as keyof Options ] as any ) ) ) {
                // console.log( 'equal arrays', p );
                continue;
            }
            // Same values? Ignore
            if ( this[ p ] === newOptions[ p as keyof Options ] as any ) {
                // console.log( 'same values', p );
                continue;
            }
            obj[ p.toString() ] = this[ p ];
            // console.log( 'copied', p );
        }
        return obj;
    }

}