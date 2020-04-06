import pMap = require( 'p-map' );
import { AugmentedSpec } from '../req';
import { FileCompiler } from './FileCompiler';

const pAll = ( iterable, options ) => pMap( iterable, ( element: any )  => element(), options );

export class MultiFileProcessor {

    constructor(
        private _fileProcessor: FileCompiler
    ) {
    }

    async process( files: string[], basePath: string = '.' ): Promise< AugmentedSpec > {

        const status = {}; // file path -> FileStatus
        const spec: AugmentedSpec = new AugmentedSpec( basePath );

        // Create a promise for every file
        const filePromises: Array< Promise< void > > = [];
        for ( const path of files ) {
            const promise = this._fileProcessor.processFile( path, status, spec );
            filePromises.push( promise );
        }
        // Compile
        // await Promise.all( filePromises );
        const tasks = filePromises.map( p => () => p );
        await pAll( tasks, { concurrency: 4, stopOnError: false } );

        // Compile imports
        for ( const path of files ) {
            await this._fileProcessor.processImports( path, status, spec );
        }

        return spec;
    }

}



