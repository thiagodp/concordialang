import { basename, dirname, relative } from 'path';
import * as terminalLink from 'terminal-link';
import { Options } from '../app/Options';
import { UI } from '../app/UI';
import { LocatedException } from '../error/LocatedException';
import { Warning } from '../error/Warning';
import { pluralS, SimpleUI } from './SimpleUI';

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
            const relPath = relative( dirname( scriptDir ), file );
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
    public announceFileSearchFinished( durationMS: number, filesFoundCount: number, filesIgnoredCount: number ): void {
        // this.stopSpinner();
        this.info(
            this.highlight( filesFoundCount ), pluralS( filesFoundCount, 'file' ), 'given,',
            this.highlight( filesIgnoredCount ), 'test case', pluralS( filesIgnoredCount, 'file' ), 'ignored',
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

    /** @inheritDoc */
    testCaseProduced(
        dirTestCases: string,
        filePath: string,
        testCasesCount: number,
        errors: LocatedException[],
        warnings: Warning[]
    ): void {

        const hasErrors = errors.length > 0;
        const hasWarnings = warnings.length > 0;
        const successful = ! hasErrors && ! hasWarnings;

        const color = successful ? this.colorSuccess : this.properColor( hasErrors, hasWarnings );
        const symbol = successful ? this.symbolSuccess : this.properSymbol( hasErrors, hasWarnings );

        this.writeln(
            color( symbol ),
            'Generated', this.highlight( relative( dirTestCases, filePath ) ),
            'with', this.highlight( testCasesCount ), pluralS( testCasesCount, 'test case' )
            );

        if ( ! hasErrors && ! hasWarnings ) {
            return;
        }

        this.showErrors( [ ...errors, ...warnings ], true );
    }

}