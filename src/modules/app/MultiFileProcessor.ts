import { FileData, SingleFileProcessor, FileMeta, SingleFileProcessorListener } from './SingleFileProcessor';
import { FileReadListener, DirectoryReadListener, DirectoryReadResult } from './listeners';
import { ProcessedFileData } from './SingleFileProcessor';
import { Options } from './Options';
import * as filewalker from 'filewalker';
import { createHash } from 'crypto';
import * as path from 'path';

export class MultiFileProcessor {

    constructor(
        private _singleProcessor: SingleFileProcessor,
        private _fileReadListener: FileReadListener,
        private _fileProcessorListener: SingleFileProcessorListener,
        private _directoryReadListener: DirectoryReadListener,
        private _multiFileProcessListener: MultiFileProcessListener
    ) {
    }

    process = ( options: Options ): Promise< MultiFileProcessedData > =>  {

        return new Promise( ( resolve, reject ) => {

            const dir: string = options.directory;

            const matchRegExp: RegExp = options.files.length > 0
                ? this.filesToRegExp( options.files )
                : this.extensionsToRegExp( options.extensions );

            const hasFilesToIgnore: boolean = options.ignore.length > 0;

            const extensions: string[] = this.prettyExtensions( options.extensions );
            const recursive: boolean = options.recursive;
            const stopOnFirstError: boolean = options.stopOnTheFirstError;

            let filePromises: Promise< ProcessedFileData >[] = [];
            let processedFiles: ProcessedFileData[] = [];
            let errors: Error[] = [];
            const startTime = Date.now();            

            this._directoryReadListener.directoryReadStarted( dir, extensions );
            this._multiFileProcessListener.multiProcessStarted();

            const filewalkerOptions = {
                maxPending: -1,
                maxAttempts: 0, // reattempts on error
                attemptTimeout: 1000,
                matchRegExp: matchRegExp,
                recursive: recursive
            };            

            let fwalker = filewalker( dir, filewalkerOptions );

            fwalker
                // .on( 'dir', ( p ) => {
                //      console.log('dir:  %s', p);
                // } )
                .on( 'file', ( p, s ) => {
                    this._fileReadListener.fileReadStarted( p, s.size );
                } )        
                .on( 'stream', ( rs, p, s, fullPath ) => {

                    if ( hasFilesToIgnore ) {
                        if ( this.filesToIgnoreToRegExp( options.ignore ).test( p ) ) {
                            this._fileReadListener.fileReadIgnored( p );
                            return;
                        }
                    }

                    rs._readableState.highWaterMark = 1024 * 1024; // 1 MB

                    let fileContent = '';

                    rs.on( 'data', ( chunk ) => {
                        fileContent += chunk;
                        this._fileReadListener.fileReadChunk( p, chunk.length );
                    } );

                    rs.on( 'end', async () => {

                        const hashStr = createHash( 'md5' )
                            .update( fileContent )
                            .digest( 'hex' );

                        this._fileReadListener.fileReadFinished( p );                            

                        const fileStartTime = Date.now();
                        const fileMeta = new FileMeta( p, s.size, hashStr );
                        try {
                            const fileData = new FileData( fileMeta, fileContent );

                            this._fileProcessorListener.processStarted( fileMeta );

                            let promise = this._singleProcessor.process( fileData );
                            filePromises.push( promise );

                            const processedData: ProcessedFileData = await promise;

                            processedFiles.push( processedData );

                            this._fileProcessorListener.processFinished( processedData );

                        } catch ( err ) {
                            // should not happen, since errors are catched internally by the processor
                            const processDurationMs = Date.now() - fileStartTime;
                            this._fileProcessorListener.processFinished( 
                                new ProcessedFileData( fileMeta, {}, processDurationMs, [ err ], [] )
                                );
                        }
                    } );

                } )
                .on( 'error', ( err ) => {
                    if ( stopOnFirstError ) {
                        return reject( err );
                    }
                    errors.push( err );
                } )
                .on( 'done', async () => {

                    let durationMs = Date.now() - startTime;

                    // TO-DO: Remove the comparison and use fwalker.dirs when its Issue 20 is fixed.
                    // https://github.com/oleics/node-filewalker/issues/20
                    const dirCount = recursive ? fwalker.dirs : 1;
                    
                    const data = new DirectoryReadResult(
                        dirCount,
                        fwalker.files,
                        fwalker.bytes,
                        durationMs,
                        errors.length
                        );                    

                    this._directoryReadListener.directoryReadFinished( data );                    

                    await Promise.all( filePromises );

                    durationMs = Date.now() - startTime;

                    this._multiFileProcessListener.multiProcessFinished( fwalker.files, durationMs );

                    return resolve( new MultiFileProcessedData( processedFiles, errors ) );
                } )
                .walk();

        } );

    };

    private filesToRegExp = ( files: string[] ): RegExp => {
        const exp = '(' + files.map( f => f.replace( '/', '\\\\' ) ).join( '|' ) + ')';
        return new RegExp( exp, 'ui' );
    };

    private filesToIgnoreToRegExp = ( files: string[] ): RegExp => {
        const exp = '(' + files.map( f => f.replace( '\\', '/' ) ).join( '|' ) + ')';
        return new RegExp( exp, 'ui' );
    };    

    private extensionsToRegExp = ( extensions: string[] ): RegExp => {
        const exp = '(' + extensions.map( e => e.indexOf( '.' ) >= 0 ? '\\' + e : '\\.' + e ).join( '|' ) + ')';
        return new RegExp( exp, 'ui' );
    };

    private prettyExtensions = ( extensions: string[] ): string[] => {
        return extensions.map( e => e.indexOf( '.' ) >= 0 ? e : '.' + e );
    };    
}



export class MultiFileProcessedData {

    constructor(
        public compiledFiles: ProcessedFileData[],
        public readErrors: Error[]
    ) {
    }
    
}


export interface MultiFileProcessListener {
    multiProcessStarted();
    multiProcessFinished( filesCount: number, durationMs: number );
}