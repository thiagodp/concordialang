import { AbstractTestScript, Plugin, TestScriptExecutionOptions, TestScriptExecutionResult, TestScriptGenerationOptions } from 'concordialang-plugin';
import * as fs from "fs";
import * as meow from 'meow';
import { join } from 'path';
import * as semverDiff from 'semver-diff';
import * as updateNotifier from 'update-notifier';
import { Document } from '../ast';
import { CLI } from '../cli/CLI';
import { CliHelp } from '../cli/CliHelp';
import { GuidedConfig } from '../cli/GuidedConfig';
import { OptionsHandler } from '../cli/OptionsHandler';
import { SimpleAppUI } from '../cli/SimpleAppUI';
import { VerboseAppUI } from '../cli/VerboseAppUI';
import { CompilerFacade } from '../compiler/CompilerFacade';
import { LanguageManager } from '../language/LanguageManager';
import { PackageBasedPluginFinder } from '../plugin/PackageBasedPluginFinder';
import { PluginController } from '../plugin/PluginController';
import { PluginData } from '../plugin/PluginData';
import { PluginManager } from '../plugin/PluginManager';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { AbstractTestScriptGenerator } from '../testscript/AbstractTestScriptGenerator';
import { TestResultAnalyzer } from '../testscript/TestResultAnalyzer';
import { DirSearcher, FileSearcher, FSDirSearcher, FSFileHandler, FSFileSearcher, toUnixPath } from '../util/file';
import { Options } from "./Options";
import { isDefined } from '../util';

/**
 * Application controller
 *
 * TO-DO: Refactor!
 *
 * @author Thiago Delgado Pinto
 */
export class AppController {

    private adaptMeowObject( meowObj: any ): any {
        let obj = Object.assign( {}, meowObj.flags );
        const input = meowObj.input;
        if ( ! obj.directory && ( isDefined( input ) && 1 === input.length ) ) {
            obj.directory = input[ 0 ];
        }
        return obj;
    }

    async start( appPath: string, processPath: string ): Promise< boolean > {

        const cli = new CLI();
        const cliHelp: CliHelp = new CliHelp();
        const meowInstance = meow( cliHelp.content(), cliHelp.meowOptions() );
        const cliOptions = this.adaptMeowObject( meowInstance );

        let appUI = new SimpleAppUI( cli, meowInstance );

        const optionsHandler = new OptionsHandler( appPath, processPath, appUI );

        let options: Options;

        // Load options
        try {
            options = await optionsHandler.load( cliOptions );
            appUI.setDebugMode( options.debug );
        } catch ( err ) {
            appUI.exception( err  );
            return false; // exit
        }

        if ( options.verbose ) {
            appUI = new VerboseAppUI( cli, meowInstance, options.debug );
        }


        if ( options.init ) {
            if ( optionsHandler.wasLoaded() ) {
                appUI.announceConfigurationFileAlreadyExists();
            } else {
                options = await ( new GuidedConfig() ).prompt( options );
                options.saveConfig = true;
            }
        }

        // Save config ?
        if ( options.saveConfig ) {
            try {
                await optionsHandler.save();
            } catch ( err ) {
                appUI.exception( err );
                // continue!
            }
        }
        //console.log( options );

        if ( options.help ) {
            appUI.showHelp();
            return true;
        }

        if ( options.about ) {
            appUI.showAbout();
            return true;
        }

        if ( options.version ) {
            appUI.showVersion();
            return true;
        }

        if ( options.init && ! options.pluginInstall ) {
            return true;
        }

        const pkg = meowInstance.pkg; // require( './package.json' );
        const notifier = updateNotifier(
            {
                pkg,
                updateCheckInterval: 1000 * 60 * 60 * 12 // 12 hours
            }
        );
        notifier.notify(); // display a message only if an update is available

        if ( !! notifier.update ) {
            const diff = semverDiff( notifier.update.current, notifier.update.latest );
            const hasBreakingChange: boolean = 'major' === diff;
            const url = 'https://github.com/thiagodp/concordialang/releases';
            appUI.announceUpdateAvailable( url, hasBreakingChange );
        }

        if ( options.newer ) {
            if ( ! notifier.update ) {
                appUI.announceNoUpdateAvailable();
            }
            return true;
        }

        let pluginData: PluginData = null;

        const dirSearcher: DirSearcher = new FSDirSearcher( fs );
        const fileSearcher: FileSearcher = new FSFileSearcher( fs );
        const fileHandler = new FSFileHandler( fs, options.encoding );

        const pluginManager: PluginManager = new PluginManager(
            appUI,
            new PackageBasedPluginFinder( options.processPath, fileHandler, dirSearcher ),
            fileHandler
            );

        let plugin: Plugin = null;

        if ( options.somePluginOption() ) {
            const pluginController: PluginController = new PluginController();
            try {
                await pluginController.process( options, pluginManager, appUI );
            } catch ( err ) {
                appUI.exception( err );
                return false;
            }
            return true;

        } else if ( options.someOptionThatRequiresAPlugin() && options.hasPluginName() ) {
            try {
                pluginData = await pluginManager.pluginWithName( options.plugin );
                if ( ! pluginData ) {
                    appUI.announcePluginNotFound( options.pluginDir, options.plugin );
                    return false;
                }
                plugin = await pluginManager.load( pluginData );
            } catch ( err ) {
                appUI.exception( err );
                return false;
            }
            if ( ! plugin ) { // needed?
                appUI.announcePluginCouldNotBeLoaded( options.plugin );
                return false;
            }

            // can continue
        }

        if ( options.languageList ) {

            const lm = new LanguageManager( fileSearcher, options.languageDir );
            try {
                const languages: string[] = await lm.availableLanguages();
                appUI.drawLanguages( languages );
            } catch ( err ) {
                appUI.exception( err );
                return false;
            }
            return true;
        }

        let hasErrors: boolean = false;
        let spec: AugmentedSpec = null;

        appUI.announceOptions( options );

        if ( options.compileSpecification ) {
            const compiler = new CompilerFacade( fs, appUI, appUI );
            try {
                [ spec, /* graph */ ] = await compiler.compile( options );
            } catch ( err ) {
                hasErrors = true;
                appUI.exception( err );
            }
        }

        if ( options.ast ) {

            const getCircularReplacer = () => {
                const seen = new WeakSet();
                return ( /* key , */ value ) => {
                    if ( 'object' === typeof value && value !== null ) {
                        if (seen.has(value)) {
                            return;
                        }
                        seen.add(value);
                    }
                    return value;
                };
            };

            try {
                await fileHandler.write( options.ast, JSON.stringify( spec, getCircularReplacer(), "  " ) );
            } catch ( e ) {
                appUI.showErrorSavingAST( options.ast, e.message );
                return false;
            }
            appUI.announceASTIsSaved( options.ast );
            return true;
        }

        if ( ! plugin && ( options.generateScript || options.executeScript || options.analyzeResult ) ) {
            appUI.announceNoPluginWasDefined();
            return true;
        }

        let abstractTestScripts: AbstractTestScript[] = [];
        let generatedTestScriptFiles: string[] = [];

        if ( spec && options.generateScript ) { // Requires a plugin

            let docs: Document[] = spec.docs;
            if ( options.files && options.files.length > 0 ) {

                const testCaseFilesToFilter = options.files.map( f => toUnixPath( f.replace( /\.feature$/u, '.testcase' ) ) );
                // console.log( '>> FILTER >>', testCaseFilesToFilter );
                // console.log( '>> docs before filter >>', spec.docs.map( d => d.fileInfo.path ) );

                const docHasPath = ( doc: Document, path: string ): boolean => {
                    // console.log( 'DOC', toUnixPath( doc.fileInfo.path ), 'PATH', toUnixPath( path ) );
                    return toUnixPath( doc.fileInfo.path ).endsWith( toUnixPath( path ) );
                };

                docs = spec.docs.filter( doc => testCaseFilesToFilter.findIndex( file => docHasPath( doc, file ) ) >= 0 );
            }

            const atsGenerator = new AbstractTestScriptGenerator();
            abstractTestScripts = atsGenerator.generate( docs, spec );

            if ( abstractTestScripts.length > 0 ) {
                // cli.newLine( cli.symbolInfo, 'Generated', abstractTestScripts.length, 'abstract test scripts' );
                let errors: Error[] = [];
                try {
                    generatedTestScriptFiles = await plugin.generateCode(
                        abstractTestScripts,
                        new TestScriptGenerationOptions(
                            options.plugin,
                            options.dirScript,
                            options.directory
                        ),
                        errors
                    );
                } catch ( err ) {
                    hasErrors = true;
                    appUI.exception( err );
                }

                appUI.showGeneratedTestScriptFiles( options.dirScript, generatedTestScriptFiles );
                appUI.showTestScriptGenerationErrors( errors );
            }
        }

        let executionResult: TestScriptExecutionResult = null;
        if ( options.executeScript ) { // Requires a plugin

            const tseo: TestScriptExecutionOptions = new TestScriptExecutionOptions(
                options.dirScript,
                options.dirResult
            );

            appUI.testScriptExecutionStarted();

            try {
                executionResult = await plugin.executeCode( tseo );
            } catch ( err ) {
                hasErrors = true;
                appUI.testScriptExecutionError( err );
            }
        } else {
            // appListener.testScriptExecutionDisabled();
        }

        if ( options.analyzeResult ) { // Requires a plugin

            let reportFile: string;
            if ( ! executionResult  ) {

                const defaultReportFile: string = join(
                    options.dirResult, await plugin.defaultReportFile() );

                if ( ! fs.existsSync( defaultReportFile ) ) {
                    appUI.announceReportFileNotFound( defaultReportFile );
                    return false;
                }

                reportFile = defaultReportFile;
            } else {
                reportFile = executionResult.sourceFile;
            }

            try {
                let reportedResult = await plugin.convertReportFile( reportFile );
                ( new TestResultAnalyzer() ).adjustResult( reportedResult, abstractTestScripts );
                appUI.testScriptExecutionFinished( reportedResult );
            } catch ( err ) {
                hasErrors = true;
                appUI.exception( err );
            }

        }


        return ! hasErrors;
    }

}