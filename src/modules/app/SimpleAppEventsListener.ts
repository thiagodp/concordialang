import { FileReadListener, DirectoryReadListener, DirectoryReadResult } from './Listeners';
import { SingleFileProcessorListener, FileMeta, ProcessedFileData } from './SingleFileProcessor';
import { MultiFileProcessListener } from './MultiFileProcessor';
import { CLI } from './CLI';
import { CompilerListener, ProcessingInfo } from './CompilerListener';
import * as prettyBytes from 'pretty-bytes';
import { Defaults } from './Defaults';
import { Options } from './Options';

export class SimpleAppEventsListener implements
    FileReadListener,
    SingleFileProcessorListener,
    DirectoryReadListener,
    MultiFileProcessListener,
    CompilerListener
{

    constructor(
        private _cli: CLI
    ) {
    }

    //
    //
    //

    /** @inherited */
    fileReadStarted = ( path: string, size: number ): void => {
        //this._cli.newLine( ... this._cli.infoArgs( 'Reading', path, ' ', prettyBytes( size ) ) );
    };

    fileReadIgnored = ( path: string ): void => {
        this._cli.newLine(
            this._cli.symbolWarning,
            'Ignoring file',
            this._cli.colorHighlight( path )
        );
    };    

    /** @inherited */
    fileReadChunk = ( path: string, chunkSize: number ): void => {
        // nothing
    };    

    /** @inherited */
    fileReadError = ( path: string, error: Error ): void => {
        this._cli.sameLine( this._cli.symbolError, 'Error reading', path, ': ', error.message );
    };

    /** @inherited */
    fileReadFinished = ( path: string ): void => {
        // if ( ! this._verbose ) {
        //     return;
        // }
        // this._cli.newLine( this._cli.symbolSuccess, path );
    };


    /** @inherited */
    directoryReadStarted = ( directory: string, extensions: string[] ): void => {

        this._cli.newLine( this._cli.symbolInfo, 'Reading directory',
            this._cli.colorHighlight( directory ) );

        const sameExtensionsAsTheDefaultOnes: boolean = 
            JSON.stringify( extensions.sort().map( e => e.toLowerCase() ) ) ===
            JSON.stringify( ( new Defaults() ).EXTENSIONS.sort() );
        
        if ( ! sameExtensionsAsTheDefaultOnes ) {
            this._cli.newLine( this._cli.symbolInfo, 'Looking for',
                ( extensions.map( e => this._cli.colorHighlight( e ) ).join( ', ' ) ), 'files...' );
        }
    };

    /** @inherited */
    directoryReadFinished = ( data: DirectoryReadResult ): void => {

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
    };



    /** @inherited */
    processStarted( meta: FileMeta ): void {        
        // nothing
    }
    
    /** @inherited */
    processFinished( data: ProcessedFileData ): void {
        this.showProcessingInfo(
            new ProcessingInfo( data.durationMs, data.errors, data.warnings ),
            data.meta
        );
    }

    private showProcessingInfo( info: ProcessingInfo, meta?: FileMeta ) {

        const hasErrors = info.errors.length > 0;
        const hasWarnings = info.warnings.length > 0;
        const color = this._cli.properColor( hasErrors, hasWarnings );
        const symbol = this._cli.properSymbol( hasErrors, hasWarnings );

        if ( ! hasErrors && ! hasWarnings ) {
            return;
        }

        if ( meta ) {
            this._cli.newLine(
                color( symbol ),
                color( meta.fullPath ),
                //this.formatHash( meta.hash ),
                this.formatDuration( info.durationMs )
            );
        }

        const spaces = ' ';

        for ( let e of info.warnings ) {
            if ( meta ) {
                this._cli.newLine( spaces, this._cli.symbolWarning, e.message );
            } else {
                this._cli.newLine( this._cli.symbolWarning, this._cli.colorWarning( e.message ) );
            }
        }

        for ( let e of info.errors ) {
            if ( meta ) {
                this._cli.newLine( spaces, this._cli.symbolError, e.message );
            } else {
                this._cli.newLine( this._cli.symbolError, this._cli.colorError( e.message ) );
            }
        }
    }


    /** @inherited */
    multiProcessStarted() {
        // empty
    }

    /** @inherited */
    multiProcessFinished( filesCount: number, durationMs: number ) {
        // empty
    }    
    
    //
    // CompilerListener
    //

    /** @inheritDoc */
    public displayOptions = ( options: Options ): void => {

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

    };    

    /** @inheritDoc */
    semanticAnalysisStarted() {
        // do nothing
    }

    /** @inheritDoc */
    semanticAnalysisFinished( info: ProcessingInfo ) {
        this.showProcessingInfo( info );
    }


    private formatHash( hash: string ): string {
        return this._cli.colorInfo( hash.substr( 0, 8 ) );
    }

    private formatDuration( durationMs: number ): string {
        return this._cli.colorInfo( '(' + durationMs.toString() + 'ms)' );
    }
}