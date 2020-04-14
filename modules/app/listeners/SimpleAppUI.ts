import { TestScriptExecutionResult } from 'concordialang-plugin/dist';
import { relative } from 'path';
import * as terminalLink from 'terminal-link';
import * as ora from 'ora';
import { CLI } from '../../cli/CLI';
import { sortErrorsByLocation } from '../../error/ErrorSorting';
import { LocatedException } from '../../error/LocatedException';
import { ProblemMapper } from '../../error/ProblemMapper';
import { Warning } from '../../error/Warning';
import { millisToString } from "../../util/TimeFormat";
import { Defaults } from '../Defaults';
import { Options } from '../Options';
import { AppUI } from './AppUI';

export class SimpleAppUI implements AppUI {

    protected _spinner = ora();

    constructor(
        protected readonly _cli: CLI,
        protected _debugMode: boolean = false
        ) {
    }

    //
    // AppEventsListener
    //

    /** @inheritdoc */
    setDebugMode( debugMode: boolean ): void {
        this._debugMode = debugMode;
    }

    /** @inheritdoc */
    show( ...args: any[] ): void {
        this._cli.newLine( ...args );
    }

    /** @inheritdoc */
    success( ...args: any[] ): void {
        this._cli.newLine( this._cli.symbolSuccess, ...args );
    }

    /** @inheritdoc */
    info( ...args: any[] ): void {
        this._cli.newLine( this._cli.symbolInfo, ...args );
    }

    /** @inheritdoc */
    warn( ...args: any[] ): void {
        this._cli.newLine( this._cli.symbolWarning, ...args );
    }

    /** @inheritdoc */
    error( ...args: any[] ): void {
        this._cli.newLine( this._cli.symbolError, ...args );
    }

    /** @inheritdoc */
    exception( error: Error ): void {
        if ( this._debugMode ) {
            this.error( error.message, this.formattedStackOf( error ) );
        } else {
            this.error( error.message );
        }
    }

    /** @inheritdoc */
    announceUpdateAvailable( link: string, isMajor: boolean ): void {
        if ( isMajor ) {
            this.show( this._cli.colorHighlight( '→' ), this._cli.bgHighlight( 'PLEASE READ THE RELEASE NOTES BEFORE UPDATING' ) );
            this.show( this._cli.colorHighlight( '→' ), link );
        } else {
            this.show( this._cli.colorHighlight( '→' ), 'See', link, 'for details.' );
        }
    }

    /** @inheritdoc */
    announceNoUpdateAvailable(): void {
        this.info( 'No updates available.' );
    }


    /** @inheritdoc */
    announceOptions( options: Options ): void {

        if ( ! options ) {
            return;
        }

        // Language
        if ( new Defaults().LANGUAGE !== options.language ) {
            this.info( 'Default language is', this._cli.colorHighlight( options.language ) );
        }

        const disabledStr = this._cli.colorHighlight( 'disabled' );

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

    // /** @inheritDoc */
    // fileReadError( path: string, error: Error ): void {
    //     this._cli.sameLine( this._cli.symbolError, 'Error reading', path, ': ', error.message );
    // }


    // /** @inheritDoc */
    // directoryReadStarted( directory: string, targets: string[], targetsAreFiles: boolean ): void {

    //     this._cli.newLine( this._cli.symbolInfo, 'Reading directory',
    //         this._cli.colorHighlight( directory ) );

    //     const sameExtensionsAsTheDefaultOnes: boolean =
    //         JSON.stringify( targets.sort().map( e => e.toLowerCase() ) ) ===
    //         JSON.stringify( ( new Defaults() ).EXTENSIONS.sort() );

    //     if ( ! sameExtensionsAsTheDefaultOnes ) {
    //         this._cli.newLine(
    //             this._cli.symbolInfo,
    //             'Looking for',
    //             ( targets.map( e => this._cli.colorHighlight( e ) ).join( ', ' ) ),
    //             targetsAreFiles ? '...' : 'files...'
    //         );
    //     }
    // }


    // /** @inheritDoc */
    // directoryReadFinished( data: DirectoryReadResult ): void {

    //     if ( data.fileErrorCount > 0 ) {
    //         if ( -1 == data.dirCount ) {
    //             this._cli.newLine(
    //                 this._cli.symbolError,
    //                 this._cli.colorError( 'Cannot read the informed directory.' )
    //             );
    //             return;
    //         } else {
    //             this._cli.newLine(
    //                 this._cli.symbolError,
    //                 this._cli.colorError( 'File read errors:' ),
    //                 data.fileErrorCount
    //             );
    //         }
    //     }

    //     this._cli.newLine( this._cli.symbolInfo,
    //         data.dirCount, 'directories analyzed,',
    //         this._cli.colorHighlight( data.filesCount + ' files found,' ),
    //         prettyBytes( data.filesSize ),
    //         this.formatDuration( data.durationMs )
    //         );
    // }

    //
    // FileCompilationListener
    //

    /** @inheritDoc */
    fileStarted( path: string ): void {
        // nothing
    }

    /** @inheritDoc */
    fileFinished( path: string, durationMS: number ): void {
        // nothing
    }

    //
    // TCGenListener
    //

    /** @inheritDoc */
    testCaseGenerationStarted( warnings: Warning[] ): void {
        // this._cli.newLine(
        //     this._cli.symbolInfo,
        //     'Test case generation started'
        // );
        this.showErrors( warnings, true );
    }

    /** @inheritDoc */
    testCaseProduced( path: string, errors: LocatedException[], warnings: Warning[] ): void {

        const hasErrors = errors.length > 0;
        const hasWarnings = warnings.length > 0;
        if ( ! hasErrors && ! hasWarnings ) {
            return;
        }
        const color = this._cli.properColor( hasErrors, hasWarnings );
        const symbol = this._cli.properSymbol( hasErrors, hasWarnings );

        this._cli.newLine(
            color( symbol ),
            'Generated',
            this._cli.colorHighlight( path )
        );

        this.showErrors( [ ...errors, ...warnings ], true );
    }

    /** @inheritDoc */
    testCaseGenerationFinished( durationMs: number ): void {
        // this._cli.newLine(
        //     this._cli.symbolInfo,
        //     'Test case generation finished',
        //     this.formatDuration( durationMs )
        // );
    }

    //
    // CompilerListener
    //

    /** @inheritDoc */
    public compilerStarted( options: Options ): void {
        this._spinner.start();
    }

    /** @inheritdoc */
    compilationFinished( durationMS: number ): void {

        this._spinner.stop();

        this.info( 'Compiled', this.formatDuration( durationMS ) );
    }

    /** @inheritdoc */
    reportProblems( problems: ProblemMapper, basePath: string ): void {

        // GENERIC
        const genericErrors: LocatedException[] = problems.getGenericErrors();
        const genericWarnings: LocatedException[] = problems.getGenericWarnings();

        this.showErrors( [ ...genericErrors, ...genericWarnings ], false );

        // PER FILE

        // When the terminal does not support links
        const fallback = ( text: string, url: string ): string => {
            return text;
        };

        const nonGeneric = problems.nonGeneric();
        for ( const [ filePath, problemInfo ] of nonGeneric ) {

            const hasErrors = problemInfo.hasErrors();
            const hasWarnings = problemInfo.hasWarnings();
            if ( ! hasErrors && ! hasWarnings ) {
                return;
            }
            const color = this._cli.properColor( hasErrors, hasWarnings );
            const symbol = this._cli.properSymbol( hasErrors, hasWarnings );

            const text = relative( basePath, filePath );
            const link = terminalLink( text, filePath, { fallback: fallback } ); // clickable URL

            this._cli.newLine(
                color( symbol ),
                this._cli.colorHighlight( link )
            );

            this.showErrors( [ ...problemInfo.errors, ...problemInfo.warnings], true );
        }

    }

    //
    // ScriptExecutionListener
    //

    private showSeparationLine(): void {
        const LINE_SIZE = 80;
        const SEPARATION_LINE = '_'.repeat( LINE_SIZE );
        this._cli.newLine( SEPARATION_LINE );
    }

    /** @inheritDoc */
    testScriptExecutionStarted(): void {
        this._cli.newLine( this._cli.symbolInfo, 'Executing test scripts...' );
        this.showSeparationLine();
    }

    /** @inheritDoc */
    testScriptExecutionDisabled(): void {
        this._cli.newLine( this._cli.symbolInfo, 'Script execution disabled.' );
    }

    /** @inheritDoc */
    testScriptExecutionError( error: Error ): void {
        this.exception( error );
        this.showSeparationLine();
    }

    /** @inheritDoc */
    testScriptExecutionFinished( r: TestScriptExecutionResult ): void {

        const LINE_SIZE = 80;
        const SEPARATION_LINE = '_'.repeat( LINE_SIZE );

        this._cli.newLine( SEPARATION_LINE );

        let t = r.total;
        if ( ! t.tests ) {
            this._cli.newLine( this._cli.symbolInfo, 'No tests executed.' );
            return;
        }

        this._cli.newLine( this._cli.symbolInfo, 'Test execution results:', "\n" );

        const passedStr = t.passed ? this._cli.bgSuccess( t.passed + ' passed' ) : '';
        const failedStr = t.failed ? this._cli.bgWarning( t.failed + ' failed' ) : '';
        const adjustedStr = t.adjusted ? this._cli.colors.bgCyan( t.adjusted + ' adjusted' ) : '';
        const errorStr = t.error ? this._cli.bgError( t.error + ' with error' ) : '';
        const skippedStr = t.skipped ? t.skipped + ' skipped' : '';
        const totalStr = ( t.tests || '0' ) + ' total';

        this._cli.newLine(
            '  ',
            [ passedStr, adjustedStr, failedStr, errorStr, skippedStr, totalStr ].filter( s => s.length > 0 ).join( ', ' ),
            this._cli.colorInfo( 'in ' + millisToString( r.durationMs, null, ' ' ) ),
            "\n"
            );

        if ( 0 == t.failed && 0 == t.error ) {
            return;
        }

        const msgReason   = this._cli.colorInfo( '       reason:' );
        const msgScript   = this._cli.colorInfo( '       script:' );
        const msgDuration = this._cli.colorInfo( '     duration:' );
        const msgTestCase = this._cli.colorInfo( '    test case:' );

        for ( let tsr of r.results ) {
            for ( let m of tsr.methods ) {
                let e = m.exception;
                if ( ! e ) {
                    continue;
                }

                let color = this.cliColorForStatus( m.status );
                let sLoc = e.scriptLocation;
                let tcLoc = e.specLocation;

                this._cli.newLine(
                    '  ', this._cli.figures.line, ' '.repeat( 9 - m.status.length ) + color( m.status + ':' ),
                    this._cli.colorHighlight( tsr.suite ), this._cli.figures.pointerSmall, this._cli.colorHighlight( m.name ),
                    "\n",
                    msgReason, e.message,
                    "\n",
                    msgScript, this._cli.colorHighlight( sLoc.filePath ), '(' + sLoc.line + ',' + sLoc.column + ')',
                    "\n",
                    msgDuration, this._cli.colorInfo( m.durationMs + 'ms' ),
                    "\n",
                    msgTestCase, this._cli.colorInfo( tcLoc.filePath, '(' + tcLoc.line + ',' + tcLoc.column + ')' ),
                    "\n"
                );
            }
        }
    }

    //
    // OTHER
    //

    protected cliColorForStatus( status: string ): any {
        switch ( status.toLowerCase() ) {
            case 'passed': return this._cli.colorSuccess;
            case 'adjusted': return this._cli.colors.cyanBright;
            case 'failed': return this._cli.colorWarning;
            case 'error': return this._cli.colorError;
            default: return this._cli.colorText;
        }
    }

    protected showErrors( errors: LocatedException[], showSpaces: boolean ) {
        if ( ! errors || errors.length < 1 ) {
            return;
        }
        const sortedErrors = sortErrorsByLocation( errors );
        const spaces = ' ';
        for ( let e of sortedErrors ) {

            const symbol = e.isWarning ? this._cli.symbolWarning : this._cli.symbolError;

            let msg = this._debugMode
                ? e.message + ' ' + this.formattedStackOf( e )
                : e.message;
            if ( showSpaces ) {
                this._cli.newLine( spaces, symbol, msg );
            } else {
                this._cli.newLine( symbol, msg );
            }
        }
    }

    protected formattedStackOf( err: Error ): string {
        return "\n  DETAILS: " + err.stack.substring( err.stack.indexOf( "\n" ) );
    }

    // private formatHash( hash: string ): string {
    //     return this._cli.colorInfo( hash.substr( 0, 8 ) );
    // }

    protected formatDuration( durationMs: number ): string {
        if ( durationMs < 0 ) {
            return '';
        }
        return this._cli.colorInfo( '(' + durationMs.toString() + 'ms)' );
    }



}