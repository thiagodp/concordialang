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
import { Defaults } from './Defaults';
import { TestScriptExecutionOptions } from '../testscript/TestScriptExecution';
import { TestCaseGenerationOptions } from '../testcase/TestCaseOptions';

export class AppController {

    start = async (): Promise< boolean > => {

        const defaults: Defaults = new Defaults();

        let cli = new CLI();
        let ui: UI = new UI( cli );
        let options: Options = ui.readOptions();

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

        let pluginData: PluginData = null;
        let pluginManager: PluginManager = new PluginManager();
        let plugin: Plugin = null;

        if ( options.somePluginOption() ) {
            let pluginController: PluginController = new PluginController( cli );
            try {
                await pluginController.process( options );
            } catch ( err ) {
                cli.newLine( cli.symbolError, err.message );
                return false;
            }
            return true;

        } else if ( options.someOptionThatRequiresAPlugin() && options.hasPluginName() ) {
            try {
                pluginData = await pluginManager.pluginWithName( options.plugin );
                plugin = await pluginManager.load( defaults.PLUGIN_DIR, pluginData );
            } catch ( err ) {
                options.debug
                    ? cli.newLine( cli.symbolError, err.message, "\n  DETAILS:", err.stack )
                    : cli.newLine( cli.symbolError, err.message );
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
                cli.newLine( cli.symbolError, err.message );
                return false;
            }            
            return true;            
        }
        
        let hasErrors: boolean = false;
        let spec: Spec = null;
        if ( options.compileSpecification ) {
            let compilerController: CompilerController = new CompilerController();
            try {
                spec = await compilerController.compile( options, cli ); 
            } catch ( err ) {
                hasErrors = true;
                cli.newLine( cli.symbolError, err.message );
            }
        } else {
            cli.newLine( cli.symbolInfo, 'Specification compilation disabled.' );
        }

        //cli.newLine( '-=[ SPEC ]=-', "\n\n" );
        //cli.newLine( spec );

        if ( options.generateExamples ) {
            // TO-DO
        } else {
            cli.newLine( cli.symbolInfo, 'Example generation disabled.' );
        }

        if ( ! plugin && ( options.generateScripts || options.executeScripts || options.analyzeResults ) ) {
            cli.newLine( cli.symbolWarning, 'A plugin must be defined.' );
            return true;
        }

        if ( options.generateScripts ) { // Requires a plugin
            // TO-DO
        } else {
            cli.newLine( cli.symbolInfo, 'Script generation disabled.' );
        }

        if ( options.executeScripts ) { // Requires a plugin
            // TO-DO
            let tseo: TestScriptExecutionOptions = new TestScriptExecutionOptions();
            try {
                await plugin.executeCode( tseo );
            } catch ( err ) {
                options.debug
                    ? cli.newLine( cli.symbolError, err.message, "\n  DETAILS:", err.stack )
                    : cli.newLine( cli.symbolError, err.message );
            }
        } else {
            cli.newLine( cli.symbolInfo, 'Script execution disabled.' );
        }

        if ( options.analyzeResults ) { // Requires a plugin
            // TO-DO
        } else {
            cli.newLine( cli.symbolInfo, 'Results\' analysis disabled.' );
        }

        if ( ! options.compileSpecification
            && ! options.generateExamples
            && ! options.generateScripts
            && ! options.executeScripts
            && ! options.analyzeResults
        ) {
            cli.newLine( cli.symbolWarning, 'Well, you have disabled all the interesting behavior. :)' );
        }

        return ! hasErrors;
    };

}