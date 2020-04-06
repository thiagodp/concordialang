import { AbstractTestScript, Plugin, TestScriptExecutionOptions, TestScriptExecutionResult, TestScriptGenerationOptions } from 'concordialang-plugin';
import * as fs from "fs";
import * as meow from 'meow';
import { join } from 'path';
import * as semverDiff from 'semver-diff';
import * as terminalLink from 'terminal-link';
import * as updateNotifier from 'update-notifier';
import { promisify } from 'util';
import { PackageBasedPluginFinder } from '../plugin/PackageBasedPluginFinder';
import { PluginController } from '../plugin/PluginController';
import { PluginData } from '../plugin/PluginData';
import { PluginDrawer } from '../plugin/PluginDrawer';
import { PluginManager } from '../plugin/PluginManager';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { TestResultAnalyzer } from '../testscript/TestResultAnalyzer';
import { FileSearcher, FSFileSearcher, FileReader, FSFileReader, DirSearcher, FSDirSearcher } from '../util/file';
import { ATSGenController } from './ATSGenController';
import { CLI } from './CLI';
import { CliHelp } from './CliHelp';
import { CliScriptExecutionReporter } from './CliScriptExecutionReporter';
import { CompilerController } from './CompilerController';
import { GuidedConfig } from './GuidedConfig';
import { LanguageController } from './LanguageController';
import { Options } from "./Options";
import { OptionsHandler } from './OptionsHandler';
import { UI } from './UI';

import Graph = require( 'graph.js/dist/graph.full.js' );

/**
 * Application controller
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

        // Load options
        try {
            options = await optionsHandler.load();
        } catch ( err ) {
            this.showException( err, options, cli );
            return false; // exit
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
                this.showException( err, options, cli );
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
        const fileReader: FileReader = new FSFileReader( fs, options.encoding );

        const pluginManager: PluginManager = new PluginManager(
            cli,
            new PackageBasedPluginFinder( options.processPath, fileReader, dirSearcher ),
            fileReader
            );

        let plugin: Plugin = null;

        if ( options.somePluginOption() ) {
            const pluginController: PluginController = new PluginController();
            const pluginDrawer = new PluginDrawer( cli );
            try {
                await pluginController.process( options, pluginManager, pluginDrawer );
            } catch ( err ) {
                this.showException( err, options, cli );
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
                this.showException( err, options, cli );
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
            let langController: LanguageController = new LanguageController( cli, fileSearcher );
            try {
                await langController.process( options );
            } catch ( err ) {
                this.showException( err, options, cli );
                return false;
            }
            return true;
        }

        let hasErrors: boolean = false;
        let spec: AugmentedSpec = null;
        // let graph: Graph = null;
        if ( options.compileSpecification ) {
            if ( ! options.generateTestCase ) {
                cli.newLine( cli.symbolInfo, 'Test Case generation disabled.' );
            }
            const compilerController: CompilerController = new CompilerController( fs );
            try {
                [ spec, /* graph */ ] = await compilerController.compile( options, cli );
            } catch ( err ) {
                hasErrors = true;
                this.showException( err, options, cli );
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
                const write = promisify( fs.writeFile );
                await write( options.ast, JSON.stringify( spec, getCircularReplacer(), "  " ) );
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
                        this.showException( err, options, cli );
                    }

                    for ( let file of files ) {
                        cli.newLine( cli.symbolSuccess, 'Generated script', cli.colorHighlight( file ) );
                    }

                    for ( let err of errors ) {
                        // cli.newLine( cli.symbolError, err.message );
                        this.showException( err, options, cli );
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
            let tseo: TestScriptExecutionOptions = new TestScriptExecutionOptions(
                options.dirScript,
                options.dirResult
            );
            cli.newLine( cli.symbolInfo, 'Executing test scripts...' );
            const LINE_SIZE = 80;
            const SEPARATION_LINE = '_'.repeat( LINE_SIZE );
            cli.newLine( SEPARATION_LINE );
            try {
                executionResult = await plugin.executeCode( tseo );
            } catch ( err ) {
                hasErrors = true;
                this.showException( err, options, cli );
                cli.newLine( SEPARATION_LINE );
            }
        } else {
            cli.newLine( cli.symbolInfo, 'Script execution disabled.' );
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
                ( new CliScriptExecutionReporter( cli ) ).scriptExecuted( reportedResult );
            } catch ( err ) {
                hasErrors = true;
                this.showException( err, options, cli );
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


    private showException( err: Error, options: Options, cli: CLI ): void {
        ( ! options ? true : options.debug )
            ? cli.newLine( cli.symbolError, err.message, this.formattedStackOf( err ) )
            : cli.newLine( cli.symbolError, err.message );
    }

    private formattedStackOf( err: Error ): string {
        return "\n  DETAILS: " + err.stack.substring( err.stack.indexOf( "\n" ) );
    }

}