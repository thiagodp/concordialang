import { basename, relative } from 'path';
import * as terminalLink from 'terminal-link';
import { Options } from '../app/Options';
import { UI } from '../app/UI';
import { Warning } from '../error/Warning';
import { SimpleUI, pluralS } from './SimpleUI';

export class VerboseUI extends SimpleUI implements UI {

    /** @inheritdoc */
    announceOptions( options: Options ): void {

        super.announceOptions( options );

        const disabledStr = this.highlight( 'disabled' );

        // Recursive
        if ( ! options.recursive ) {
            this.info( 'Directory recursion', disabledStr );
        }

        if ( ! options.compileSpecification ) {
            this.info( 'Specification compilation', disabledStr );
        } else {
            if ( ! options.generateTestCase ) {
                this.info( 'Test Case generation', disabledStr );
            }
        }

        if ( ! options.generateScript ) {
            this.info( 'Test script generation disabled', disabledStr );
        }

        if ( ! options.executeScript ) {
            this.info( 'Test script execution', disabledStr );
        }

        if ( ! options.analyzeResult ) {
            this.info( 'Test script results\' analysis', disabledStr );
        }

        if ( ! options.compileSpecification
            && ! options.generateTestCase
            && ! options.generateScript
            && ! options.executeScript
            && ! options.analyzeResult
        ) {
            this.warn( 'Well, you have disabled all the interesting behavior. :)' );
        }

    }

    /** @inheritdoc */
    showGeneratedTestScriptFiles( scriptDir: string, files: string[], durationMS: number ): void {

        super.showGeneratedTestScriptFiles( scriptDir, files, durationMS );

        // When the terminal does not support links
        const fallback = ( text: string, url: string ): string => {
            return text;
        };

        for ( const file of files ) {
            const relPath = relative( scriptDir, file );
            const link = terminalLink( relPath, file, { fallback: fallback } ); // clickable URL
            this.success( 'Generated script', this.highlight( link ) );
        }
    }

    //
    // FileCompilationListener
    //

    /** @inheritDoc */
    fileStarted( path: string ): void {
        this.info( 'Compiling', this.highlight( path ), '...' );
    }

    //
    // OptionsListener
    //

    /** @inheritDoc */
    announceConfigurationFileLoaded( filePath: string, durationMS: number ): void {
        this.info(
            'Configuration file loaded:',
            this.highlight( this._debugMode ? filePath : basename( filePath ) ),
            this.formatDuration( durationMS )
        );
    }


    /** @inheritDoc */
    announceCouldNotLoadConfigurationFile( errorMessage: string ): void {
        // this.warn(
        //     'Could not load the configuration file:',
        //     errorMessage
        //     );

        const msg = 'Could not load the configuration file';
        if ( this._debugMode ) {
            this.warn( msg + ':', errorMessage );
            return;
        }
        this.warn( msg );
    }

    /** @inheritDoc */
    announceRealSeed( realSeed: string ): void {
        this.info( 'Real seed', this.highlight( realSeed ) );
    }

    //
    // CompilerListener
    //

    /** @inheritdoc */
    public announceFileSearchFinished( durationMS: number, files: string[] ): void {
        // this.stopSpinner();
        const len = files.length;
        this.info(
            this.highlight( len ), pluralS( len, 'file' ), 'given',
            this.formatDuration( durationMS )
            );
    }

    //
    // TCGenListener
    //

    /** @inheritDoc */
    testCaseGenerationStarted( strategyWarnings: Warning[] ) {
        if ( strategyWarnings.length > 0 ) {
            this.info( 'Test case generation started' );
            this.showErrors( strategyWarnings, true );
        }
    }

}