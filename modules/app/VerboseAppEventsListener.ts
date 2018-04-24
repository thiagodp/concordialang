import { FileReadListener, DirectoryReadListener, DirectoryReadResult } from './Listeners';
import { SingleFileProcessorListener, FileMeta, ProcessedFileData } from './SingleFileProcessor';
import { MultiFileProcessListener } from './MultiFileProcessor';
import { CLI } from './CLI';
import { CompilerListener } from './CompilerListener';
import * as prettyBytes from 'pretty-bytes';
import { Options } from './Options';
import { sortErrorsByLocation } from '../util/ErrorSorting';
import { ProcessingInfo } from './ProcessingInfo';
import { TCGenListener } from './TCGenListener';
import { LocatedException } from '../req/LocatedException';
import { Warning } from '../req/Warning';
import { isDefined } from '../util/TypeChecking';

export class VerboseAppEventsListener implements
    FileReadListener,
    SingleFileProcessorListener,
    DirectoryReadListener,
    MultiFileProcessListener,
    CompilerListener,
    TCGenListener

{

    constructor(
        private _cli: CLI
    ) {
    }

    //
    // FileReadListener
    //

    /** @inheritDoc */
    fileReadStarted( path: string, size: number ): void {
        //this._cli.newLine( ... this._cli.infoArgs( 'Reading', path, ' ', prettyBytes( size ) ) );
    }

    /** @inheritDoc */
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
        // empty
    }

    //
    // DirectoryReadListener
    //

    /** @inheritDoc */
    directoryReadStarted( directory: string, targets: string[], targetsAreFiles: boolean ): void {

        this._cli.newLine( this._cli.symbolInfo, 'Reading directory',
            this._cli.colorHighlight( directory ) );

        this._cli.newLine(
            this._cli.symbolInfo,
            'Looking for',
            ( targets.map( e => this._cli.colorHighlight( e ) ).join( ', ' ) ),
            targetsAreFiles ? '...' : 'files...'
        );
    }

    /** @inheritDoc */
    directoryReadFinished( data: DirectoryReadResult ): void {

        this._cli.newLine( this._cli.symbolInfo,
            data.dirCount, 'directories analyzed,',
            this._cli.colorHighlight( data.filesCount ), 'files found,',
            prettyBytes( data.filesSize ),
            this.formatDuration( data.durationMs )
            );

        if ( data.fileErrorCount > 0 ) {
            const msg2 = this._cli.colorError( 'Read errors: ' ) + data.fileErrorCount;
            this._cli.newLine( this._cli.symbolItem, msg2 );
        }
    }

    //
    // SingleFileProcessorListener
    //

    /** @inheritDoc */
    processStarted( meta: FileMeta ): void {
        this._cli.newLine( this._cli.symbolInfo, 'Compiling',
            this._cli.colorHighlight( meta.fullPath ), '...' );
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
        this._cli.newLine( this._cli.symbolInfo, 'Invidual compilation started...' );
    }

    /** @inheritDoc */
    multiProcessFinished( filesCount: number, durationMs: number ) {

        if ( filesCount < 1 ) {
            this._cli.newLine(
                this._cli.symbolInfo,
                'No files compiled.'
            );
            return;
        }

        this._cli.newLine(
            this._cli.symbolInfo,
            'Individual compilation finished',
            this.formatDuration( durationMs )
        );
    }

    //
    // CompilerListener
    //

    /** @inheritDoc */
    public compilerStarted( options: Options ): void {

        // Language
        this._cli.newLine(
            this._cli.symbolInfo,
            'Default language is',
            this._cli.colorHighlight( options.language )
        );

        // Recursive
        this._cli.newLine(
            this._cli.symbolInfo,
            'Directory recursion',
            this._cli.colorHighlight( options.recursive ? 'enabled' : 'disabled' )
        );

    }

    /** @inheritDoc */
    semanticAnalysisStarted() {
        // empty
    }

    /** @inheritDoc */
    semanticAnalysisFinished( info: ProcessingInfo ) {

        this._cli.newLine(
            this._cli.symbolInfo,
            'Semantic analysis finished',
            this.formatDuration( info.durationMs )
        );

        this.showProcessingInfo( info );
    }

    //
    // TCGenListener
    //

    /** @inheritDoc */
    testCaseGenerationStarted( warnings: Warning[] ) {
        this._cli.newLine(
            this._cli.symbolInfo,
            'Test case generation started'
        );
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
    testCaseGenerationFinished( durationMs: number ) {
        this._cli.newLine(
            this._cli.symbolInfo,
            'Test case generation finished',
            this.formatDuration( durationMs )
        );
    }

    // OTHER


    private showProcessingInfo( info: ProcessingInfo, meta?: FileMeta ) {

        const hasErrors = info.errors.length > 0;
        const hasWarnings = info.warnings.length > 0;
        const color = this._cli.properColor( hasErrors, hasWarnings );
        const symbol = this._cli.properSymbol( hasErrors, hasWarnings );

        if ( ! hasErrors && ! hasWarnings ) {
            return;
        }
        const sortedWarnings = sortErrorsByLocation( info.warnings );
        const sortedErrors = sortErrorsByLocation( info.errors );

        if ( meta ) {
            this._cli.newLine(
                color( symbol ),
                color( meta.fullPath ),
                //this.formatHash( meta.hash ),
                this.formatDuration( info.durationMs )
            );
        }

        const showSpaces = isDefined( meta );

        this.showErrors( sortedErrors, this._cli.symbolError, showSpaces );

        this.showErrors( sortedWarnings, this._cli.symbolWarning, showSpaces );
    }

    private showErrors( errors: LocatedException[], symbol: string, showSpaces: boolean ) {
        if ( errors.length < 1 ) {
            return;
        }
        const sortedErrors = sortErrorsByLocation( errors );
        const spaces = ' ';
        for ( let e of sortedErrors ) {
            if ( showSpaces ) {
                this._cli.newLine( spaces, symbol, e.message );
            } else {
                this._cli.newLine( symbol, e.message );
            }
        }
    }

    private formatHash( hash: string ): string {
        return this._cli.colorInfo( hash.substr( 0, 8 ) );
    }

    private formatDuration( durationMs: number ): string {
        return this._cli.colorInfo( '(' + durationMs.toString() + 'ms)' );
    }

}