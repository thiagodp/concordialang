import { AbstractTestScript, Plugin, TestScriptExecutionOptions, TestScriptExecutionResult, TestScriptGenerationOptions } from 'concordialang-plugin';
import * as fs from "fs";
import * as meow from 'meow';
import { join } from 'path';
import * as semverDiff from 'semver-diff';
import * as terminalLink from 'terminal-link';
import * as updateNotifier from 'update-notifier';
import { CLI } from '../cli/CLI';
import { CliHelp } from '../cli/CliHelp';
import { GuidedConfig } from '../cli/GuidedConfig';
import { LanguageDrawer } from '../cli/LanguageDrawer';
import { OptionsHandler } from '../cli/OptionsHandler';
import { UI } from '../cli/UI';
import { CompilerFacade } from '../compiler/CompilerFacade';
import { LanguageManager } from '../language/LanguageManager';
import { PackageBasedPluginFinder } from '../plugin/PackageBasedPluginFinder';
import { PluginController } from '../plugin/PluginController';
import { PluginData } from '../plugin/PluginData';
import { PluginDrawer } from '../plugin/PluginDrawer';
import { PluginManager } from '../plugin/PluginManager';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { TestResultAnalyzer } from '../testscript/TestResultAnalyzer';
import { DirSearcher, FileSearcher, FSDirSearcher, FSFileHandler, FSFileSearcher } from '../util/file';
import { ATSGenController } from './ATSGenController';
import { SimpleAppUI } from './listeners/SimpleAppUI';
import { VerboseAppUI } from './listeners/VerboseAppUI';
import { Options } from "./Options";

/**
 * Application controller
 *
 * TO-DO: Refactor!
 *
 * @author Thiago Delgado Pinto
 */
export class AppController {

    async start( appPath: string, processPath: string ): Promise< boolean > {

        const cli = new CLI();
        const cliHelp: CliHelp = new CliHelp();
        const meowInstance = meow( cliHelp.content(), cliHelp.meowOptions() );

        const optionsHandler = new OptionsHandler( appPath, processPath, cli, meowInstance );
        let options: Options;

        let appListener = new SimpleAppUI( cli );

        // Load options
        try {
            options = await optionsHandler.load();
            appListener.setDebugMode( options.debug );
        } catch ( err ) {
            appListener.showError( err  );
            return false; // exit
        }

        if ( options.verbose ) {
            appListener = new VerboseAppUI( cli, options.debug );
        }


        if ( options.init ) {
            if ( optionsHandler.wasLoaded() ) {
                cli.newLine( cli.symbolWarning, 'You already have a configuration file.' );
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
                appListener.showError( err  );
                // continue!
            }
        }


        let ui: UI = new UI( cli, meowInstance );

        //console.log( options );

        if ( options.help ) {
            ui.showHelp();
            return true;
        }

        if ( options.about ) {
            ui.showAbout();
            return true;
        }

        if ( options.version ) {
            ui.showVersion();
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

            // When the terminal does not support links
            const fallback = ( text: string, url: string ): string => {
                return url;
            };

            const url = 'https://github.com/thiagodp/concordialang/releases';
            const link = terminalLink( url, url, { fallback: fallback } ); // clickable URL

            const diff = semverDiff( notifier.update.current, notifier.update.latest );
            const hasBreakingChange: boolean = 'major' === diff;

            if ( hasBreakingChange ) {
                cli.newLine( cli.colorHighlight( '→' ), cli.bgHighlight( 'PLEASE READ THE RELEASE NOTES BEFORE UPDATING' ) );
                cli.newLine( cli.colorHighlight( '→' ), link );
            } else {
                cli.newLine( cli.colorHighlight( '→' ), 'See', link, 'for details.' );
            }
        }

        if ( options.newer ) {
            if ( ! notifier.update ) {
                cli.newLine( cli.symbolInfo, 'No update available' );
            }
            return true;
        }

        let pluginData: PluginData = null;

        const dirSearcher: DirSearcher = new FSDirSearcher( fs );
        const fileSearcher: FileSearcher = new FSFileSearcher( fs );
        const fileHandler = new FSFileHandler( fs, options.encoding );

        const pluginManager: PluginManager = new PluginManager(
            cli,
            new PackageBasedPluginFinder( options.processPath, fileHandler, dirSearcher ),
            fileHandler
            );

        let plugin: Plugin = null;

        if ( options.somePluginOption() ) {
            const pluginController: PluginController = new PluginController();
            const pluginDrawer = new PluginDrawer( cli );
            try {
                await pluginController.process( options, pluginManager, pluginDrawer );
            } catch ( err ) {
                appListener.showError( err );
                return false;
            }
            return true;

        } else if ( options.someOptionThatRequiresAPlugin() && options.hasPluginName() ) {
            try {
                pluginData = await pluginManager.pluginWithName( options.plugin );
                if ( ! pluginData ) {
                    cli.newLine( cli.symbolError, 'Plugin "' + options.plugin + '" not found at "' + options.pluginDir + '".' );
                    return true;
                }
                plugin = await pluginManager.load( pluginData );
            } catch ( err ) {
                appListener.showError( err );
                return false;
            }
            if ( ! pluginData ) { // needed?
                cli.newLine( cli.symbolError, 'Plugin not found:', options.plugin );
                return false;
            }
            if ( ! plugin ) { // needed?
                cli.newLine( cli.symbolError, 'Could not load the plugin:', options.plugin );
                return false;
            }

            // can continue
        }

        if ( options.languageList ) {
            try {
                await this.listLanguages( options, cli, fileSearcher );
            } catch ( err ) {
                appListener.showError( err );
                return false;
            }
            return true;
        }

        let hasErrors: boolean = false;
        let spec: AugmentedSpec = null;

        if ( options.compileSpecification ) {

            if ( ! options.generateTestCase ) {
                cli.newLine( cli.symbolInfo, 'Test Case generation disabled.' );
            }

            const compiler = new CompilerFacade( fs, appListener, appListener );
            try {
                [ spec, /* graph */ ] = await compiler.compile( options );
            } catch ( err ) {
                hasErrors = true;
                appListener.showError( err );
            }
        } else {
            cli.newLine( cli.symbolInfo, 'Specification compilation disabled.' );
        }

        //cli.newLine( '-=[ SPEC ]=-', "\n\n" );
        //cli.newLine( spec );
        if ( options.ast ) {

            const getCircularReplacer = () => {
                const seen = new WeakSet();
                return ( key, value ) => {
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
                cli.newLine( cli.symbolError, 'Error saving', cli.colorHighlight( options.ast ), ': ' + e.message );
                return false;
            }

            cli.newLine( cli.symbolInfo, 'Saved', cli.colorHighlight( options.ast ) );

            return true;
        }

        if ( ! plugin && ( options.generateScript || options.executeScript || options.analyzeResult ) ) {
            cli.newLine( cli.symbolWarning, 'A plugin was not defined.' );
            return true;
        }

        let abstractTestScripts: AbstractTestScript[] = [];

        if ( spec !== null ) {

            const atsCtrl = new ATSGenController();
            abstractTestScripts = atsCtrl.generate( spec );

            if ( options.generateScript ) { // Requires a plugin

                if ( abstractTestScripts.length > 0 ) {

                    // cli.newLine( cli.symbolInfo, 'Generated', abstractTestScripts.length, 'abstract test scripts' );

                    let errors: Error[] = [];
                    let files: string[] = [];
                    try {
                        files = await plugin.generateCode(
                            abstractTestScripts,
                            new TestScriptGenerationOptions(
                                options.plugin,
                                options.dirScript
                            ),
                            errors
                        );
                    } catch ( err ) {
                        hasErrors = true;
                        appListener.showError( err );
                    }

                    for ( let file of files ) {
                        cli.newLine( cli.symbolSuccess, 'Generated script', cli.colorHighlight( file ) );
                    }

                    for ( let err of errors ) {
                        // cli.newLine( cli.symbolError, err.message );
                        appListener.showError( err );
                    }

                } else {
                    // cli.newLine( cli.symbolInfo, 'No generated abstract test scripts.' ); // no needed
                }

            } else {
                cli.newLine( cli.symbolInfo, 'Script generation disabled.' );
            }
        }

        let executionResult: TestScriptExecutionResult = null;
        if ( options.executeScript ) { // Requires a plugin

            const tseo: TestScriptExecutionOptions = new TestScriptExecutionOptions(
                options.dirScript,
                options.dirResult
            );

            appListener.testScriptExecutionStarted();

            try {
                executionResult = await plugin.executeCode( tseo );
            } catch ( err ) {
                hasErrors = true;
                appListener.testScriptExecutionError( err );
            }
        } else {
            appListener.testScriptExecutionDisabled();
        }

        if ( options.analyzeResult ) { // Requires a plugin

            let reportFile: string;
            if ( ! executionResult  ) {

                const defaultReportFile: string = join(
                    options.dirResult, await plugin.defaultReportFile() );

                if ( ! fs.existsSync( defaultReportFile ) ) {
                    cli.newLine( cli.symbolWarning, 'Could not retrieve execution results.' );
                    return false;
                }

                reportFile = defaultReportFile;
            } else {
                reportFile = executionResult.sourceFile;
            }

            try {
                let reportedResult = await plugin.convertReportFile( reportFile );
                ( new TestResultAnalyzer() ).adjustResult( reportedResult, abstractTestScripts );
                appListener.testScriptExecutionFinished( reportedResult );
            } catch ( err ) {
                hasErrors = true;
                appListener.showError( err );
            }

        } else {
            cli.newLine( cli.symbolInfo, 'Results\' analysis disabled.' );
        }

        if ( ! options.compileSpecification
            && ! options.generateTestCase
            && ! options.generateScript
            && ! options.executeScript
            && ! options.analyzeResult
        ) {
            cli.newLine( cli.symbolWarning, 'Well, you have disabled all the interesting behavior. :)' );
        }

        return ! hasErrors;
    }


    async listLanguages( options: Options, cli: CLI, fileSearcher: FileSearcher ) {
        const lm = new LanguageManager( fileSearcher, options.languageDir );
        const languages: string[] = await lm.availableLanguages();
        const ld = new LanguageDrawer( cli );
        ld.drawLanguages( languages );
    }

}