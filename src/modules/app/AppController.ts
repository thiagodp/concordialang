import { UI } from './UI';
import { Options } from "./Options";
import { PluginController } from '../plugin/PluginController';
import { CLI } from './CLI';
import { CompilerController } from './CompilerController';
import { Spec } from '../ast/Spec';
import { LanguageController } from './LanguageController';

export class AppController {

    start = async () => {

        let cli = new CLI();
        let ui: UI = new UI( cli );
        let options: Options = ui.readOptions();
        //console.log( options );

        if ( options.help ) {
            ui.showHelp();
            return;
        }
    
        if ( options.about ) {
            ui.showAbout();
            return;
        }

        if ( options.version ) {
            ui.showVersion();
            return;
        }

        if ( options.somePluginOption() ) {
            let pluginController: PluginController = new PluginController( cli );
            try {
                await pluginController.process( options );
            } catch ( err ) {
                cli.newLine( cli.symbolError, err.message );
            }            
            return;
        }

        if ( options.languageList ) {
            let langController: LanguageController = new LanguageController( cli );
            try {
                await langController.process( options );
            } catch ( err ) {
                cli.newLine( cli.symbolError, err.message );
            }            
            return;            
        }
        
        let spec: Spec = null;
        if ( options.compileSpecification ) {
            let compilerController: CompilerController = new CompilerController();
            try {
                spec = await compilerController.compile( options, cli ); 
            } catch ( err ) {
                cli.newLine( cli.symbolError, err.message );
            }
        } else {
            cli.newLine( cli.symbolInfo, 'Specification compilation disabled.' );
        }

        if ( options.generateExamples ) {
            // TO-DO
        } else {
            cli.newLine( cli.symbolInfo, 'Example generation disabled.' );
        }

        if ( options.generateScripts ) {
            // TO-DO
        } else {
            cli.newLine( cli.symbolInfo, 'Script generation disabled.' );
        }

        if ( options.executeScripts ) {
            // TO-DO
        } else {
            cli.newLine( cli.symbolInfo, 'Script execution disabled.' );
        }

        if ( options.analyzeResults ) {
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

    };

}