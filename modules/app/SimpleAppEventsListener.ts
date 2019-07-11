import * as prettyBytes from 'pretty-bytes';

import { LocatedException } from '../error/LocatedException';
import { FileReadListener, DirectoryReadListener, DirectoryReadResult } from './Listeners';
import { SingleFileProcessorListener, FileMeta, ProcessedFileData } from './SingleFileProcessor';
import { MultiFileProcessListener } from './MultiFileProcessor';
import { CLI } from './CLI';
import { CompilerListener } from './CompilerListener';
import { Defaults } from './Defaults';
import { Options } from './Options';
import { sortErrorsByLocation } from '../util/ErrorSorting';
import { ProcessingInfo } from './ProcessingInfo';
import { TCGenListener } from './TCGenListener';
import { Warning } from '../req/Warning';
import { isDefined } from '../util/TypeChecking';

export class SimpleAppEventsListener implements
    FileReadListener,
    SingleFileProcessorListener,
    DirectoryReadListener,
    MultiFileProcessListener,
    CompilerListener,
    TCGenListener
{

    constructor(
        private _cli: CLI,
        private _debug: boolean = false
    ) {
    }

    //
    // FileReadListener
    //

    /** @inheritDoc */
    fileReadStarted( path: string, size: number ): void {
        //this._cli.newLine( ... this._cli.infoArgs( 'Reading', path, ' ', prettyBytes( size ) ) );
    }

    fileReadIgnored( path: string ): void {
        this._cli.newLine(
            this._cli.symbolWarning,
            'Ignoring file',
            this._cli.colorHighlight( path )
        );
    }

    /** @inheritDoc */
    fileReadChunk( path: string, chunkSize: number ): void {
        // empty
    }

    /** @inheritDoc */
    fileReadError( path: string, error: Error ): void {
        this._cli.sameLine( this._cli.symbolError, 'Error reading', path, ': ', error.message );
    }

    /** @inheritDoc */
    fileReadFinished( path: string ): void {
        // if ( ! this._verbose ) {
        //     return;
        // }
        // this._cli.newLine( this._cli.symbolSuccess, path );
    }

    //
    // DirectoryReadListener
    //

    /** @inheritDoc */
    directoryReadStarted( directory: string, targets: string[], targetsAreFiles: boolean ): void {

        this._cli.newLine( this._cli.symbolInfo, 'Reading directory',
            this._cli.colorHighlight( directory ) );

        const sameExtensionsAsTheDefaultOnes: boolean =
            JSON.stringify( targets.sort().map( e => e.toLowerCase() ) ) ===
            JSON.stringify( ( new Defaults() ).EXTENSIONS.sort() );

        if ( ! sameExtensionsAsTheDefaultOnes ) {
            this._cli.newLine(
                this._cli.symbolInfo,
                'Looking for',
                ( targets.map( e => this._cli.colorHighlight( e ) ).join( ', ' ) ),
                targetsAreFiles ? '...' : 'files...'
            );
        }
    }

    /** @inheritDoc */
    directoryReadFinished( data: DirectoryReadResult ): void {

        if ( data.fileErrorCount > 0 ) {
            if ( -1 == data.dirCount ) {
                this._cli.newLine(
                    this._cli.symbolError,
                    this._cli.colorError( 'Cannot read the informed directory.' )
                );
                return;
            } else {
                this._cli.newLine(
                    this._cli.symbolError,
                    this._cli.colorError( 'File read errors:' ),
                    data.fileErrorCount
                );
            }
        }

        this._cli.newLine( this._cli.symbolInfo,
            data.dirCount, 'directories analyzed,',
            this._cli.colorHighlight( data.filesCount + ' files found,' ),
            prettyBytes( data.filesSize ),
            this.formatDuration( data.durationMs )
            );
    }

    //
    // SingleFileProcessorListener
    //

    /** @inheritDoc */
    processStarted( meta: FileMeta ): void {
        // nothing
    }

    /** @inheritDoc */
    processFinished( data: ProcessedFileData ): void {
        this.showProcessingInfo(
            new ProcessingInfo( data.durationMs, data.errors, data.warnings ),
            data.meta
        );
    }

    //
    // MultiFileProcessListener
    //

    /** @inheritDoc */
    multiProcessStarted() {
        // empty
    }

    /** @inheritDoc */
    multiProcessFinished( filesCount: number, durationMs: number ) {
        // empty
    }

    //
    // CompilerListener
    //

    /** @inheritDoc */
    public compilerStarted( options: Options ): void {

        // Language
        if ( new Defaults().LANGUAGE !== options.language ) {
            this._cli.newLine(
                this._cli.symbolInfo,
                'Default language is',
                this._cli.colorHighlight( options.language )
            );
        }

        // Recursive
        if ( ! options.recursive ) {
            this._cli.newLine(
                this._cli.symbolInfo,
                'Directory recursion',
                this._cli.colorHighlight( 'disabled' )
            );
        }

    }

    /** @inheritDoc */
    semanticAnalysisStarted() {
        // do nothing
    }

    /** @inheritDoc */
    semanticAnalysisFinished( info: ProcessingInfo ) {
        this.showProcessingInfo( info );
    }


    //
    // TCGenListener
    //

    /** @inheritDoc */
    testCaseGenerationStarted( warnings: Warning[] ) {
        // this._cli.newLine(
        //     this._cli.symbolInfo,
        //     'Test case generation started'
        // );
        this.showErrors( warnings, this._cli.symbolWarning, true );
    }

    /** @inheritDoc */
    testCaseProduced( path: string, errors: LocatedException[], warnings: Warning[] ) {

        const hasErrors = errors.length > 0;
        const hasWarnings = warnings.length > 0;
        const color = this._cli.properColor( hasErrors, hasWarnings );
        const symbol = this._cli.properSymbol( hasErrors, hasWarnings );

        this._cli.newLine(
            color( symbol ),
            'Generated',
            this._cli.colorHighlight( path )
        );

        this.showErrors( errors, this._cli.symbolError, true );
        this.showErrors( warnings, this._cli.symbolWarning, true );
    }

    /** @inheritDoc */
    testCaseGenerationFinished( durationMs ) {
        // this._cli.newLine(
        //     this._cli.symbolInfo,
        //     'Test case generation finished',
        //     this.formatDuration( durationMs )
        // );
    }

    // OTHER

    private showProcessingInfo( info: ProcessingInfo, meta?: FileMeta ) {

        const hasErrors = info.errors.length > 0;
        const hasWarnings = info.warnings.length > 0;
        if ( ! hasErrors && ! hasWarnings ) {
            return;
        }

        if ( meta ) {
            const color = this._cli.properColor( hasErrors, hasWarnings );
            const symbol = this._cli.properSymbol( hasErrors, hasWarnings );

            this._cli.newLine(
                color( symbol ),
                this._cli.colorHighlight( meta.fullPath ),
                //this.formatHash( meta.hash ),
                this.formatDuration( info.durationMs )
            );
        }

        const showSpaces = isDefined( meta );

        this.showErrors( info.errors, this._cli.symbolError, showSpaces );

        this.showErrors( info.warnings, this._cli.symbolWarning, showSpaces );
    }

    private showErrors( errors: LocatedException[], symbol: string, showSpaces: boolean ) {
        if ( errors.length < 1 ) {
            return;
        }
        const sortedErrors = sortErrorsByLocation( errors );
        const spaces = ' ';
        for ( let e of sortedErrors ) {
            let msg = this._debug
                ? e.message + ' ' + this.formattedStackOf( e )
                : e.message;
            if ( showSpaces ) {
                this._cli.newLine( spaces, symbol, msg );
            } else {
                this._cli.newLine( symbol, msg );
            }
        }
    }

    private formattedStackOf( err: Error ): string {
        return "\n  DETAILS: " + err.stack.substring( err.stack.indexOf( "\n" ) );
    }

    // private formatHash( hash: string ): string {
    //     return this._cli.colorInfo( hash.substr( 0, 8 ) );
    // }

    private formatDuration( durationMs: number ): string {
        if ( durationMs < 0 ) {
            return '';
        }
        return this._cli.colorInfo( '(' + durationMs.toString() + 'ms)' );
    }

}