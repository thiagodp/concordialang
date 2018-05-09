import { UI } from './UI';
import { Options } from "./Options";
import { PluginController } from '../plugin/PluginController';
import { CLI } from './CLI';
import { CompilerController } from './CompilerController';
import { Spec } from '../ast/Spec';
import { LanguageController } from './LanguageController';
import { PluginData } from '../plugin/PluginData';
import { PluginManager } from '../plugin/PluginManager';
import { Plugin } from '../plugin/Plugin';
import { TestScriptExecutionOptions, TestScriptExecutionResult } from '../testscript/TestScriptExecution';
import { CliScriptExecutionReporter } from './CliScriptExecutionReporter';
import { TCGenController } from './TCGenController';
import Graph = require( 'graph.js/dist/graph.full.js' );
import { ATSGenController } from './ATSGenController';
import { TestScriptGenerationOptions } from '../testscript/TestScriptOptions';
import { CliHelp } from './CliHelp';
import { OptionsHandler } from './OptionsHandler';
import * as meow from 'meow';
import * as updateNotifier from 'update-notifier';

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

        const pkg = meowInstance.pkg; // require( './package.json' );
        const oneDay = 1000 * 60 * 60 * 24;
        const notifier = updateNotifier(
            {
                pkg,
                updateCheckInterval: oneDay
            }
        );
        notifier.notify();

        if ( options.newer ) {
            if ( ! notifier.update ) {
                cli.newLine( cli.symbolInfo, 'No update available' );
            }
            return true;
        }

        let pluginData: PluginData = null;
        let pluginManager: PluginManager = new PluginManager( options.pluginDir );
        let plugin: Plugin = null;

        if ( options.somePluginOption() ) {
            let pluginController: PluginController = new PluginController( cli );
            try {
                await pluginController.process( options );
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
            let langController: LanguageController = new LanguageController( cli );
            try {
                await langController.process( options );
            } catch ( err ) {
                this.showException( err, options, cli );
                return false;
            }
            return true;
        }

        let hasErrors: boolean = false;
        let spec: Spec = null;
        let graph: Graph = null;
        if ( options.compileSpecification ) {
            if ( ! options.generateTestCase ) {
                cli.newLine( cli.symbolInfo, 'Test Case generation disabled.' );
            }
            let compilerController: CompilerController = new CompilerController();
            try {
                [ spec, graph ] = await compilerController.compile( options, cli );
            } catch ( err ) {
                hasErrors = true;
                this.showException( err, options, cli );
            }
        } else {
            cli.newLine( cli.symbolInfo, 'Specification compilation disabled.' );
        }

        //cli.newLine( '-=[ SPEC ]=-', "\n\n" );
        //cli.newLine( spec );

        if ( ! plugin && ( options.generateScript || options.executeScript || options.analyzeResult ) ) {
            cli.newLine( cli.symbolWarning, 'A plugin was not defined.' );
            return true;
        }

        if ( spec !== null ) {
            if ( options.generateScript ) { // Requires a plugin

                const atsCtrl = new ATSGenController();
                let abstractTestScripts = atsCtrl.generate( spec );

                if ( abstractTestScripts.length > 0 ) {

                    // cli.newLine( cli.symbolInfo, 'Generated', abstractTestScripts.length, 'abstract test scripts' );

                    let errors: Error[] = [];
                    let files: string[] = [];
                    try {
                        files = await plugin.generateCode(
                            abstractTestScripts,
                            new TestScriptGenerationOptions(
                                options.dirScript,
                                options.dirResult
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
                        cli.newLine( cli.symbolError, err.message );
                    }

                } else {
                    cli.newLine( cli.symbolInfo, 'No generated abstract test scripts.' );
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
            }
        } else {
            cli.newLine( cli.symbolInfo, 'Script execution disabled.' );
        }

        if ( options.analyzeResult ) { // Requires a plugin
            if ( ! executionResult  ) {
                cli.newLine( cli.symbolError, 'Could not retrieve execution results.' );
                return false;
            }
            try {
                executionResult = await plugin.convertReportFile( executionResult.sourceFile );
                ( new CliScriptExecutionReporter( cli ) ).scriptExecuted( executionResult );
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