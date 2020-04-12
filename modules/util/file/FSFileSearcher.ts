import * as fsWalk from '@nodelib/fs.walk';
import { join, normalize } from 'path';
import { promisify } from "util";
import { FileSearcher, FileSearchOptions } from "./FileSearcher";


export class FSFileSearcher implements FileSearcher {

    constructor( private readonly _fs: any ) {
    }

    async searchFrom( options: FileSearchOptions ): Promise< string[] > {

        // Whether the given directory is a file, return it
        const pStat = promisify( this._fs.stat );
        const st = await pStat( options.directory );
        if ( ! st.isDirectory() ) {
            const msg = `${options.directory} is not a directory.`;
            throw new Error( msg );
        }

        const makeFilePath = file => {
            return normalize( join( options.directory, file ) );
        };

        const hasFilesToSearch: boolean = options.files.length > 0;
        const hasFilesToIgnore: boolean = options.ignore.length > 0;

        const ignoredFullPath: string[] = hasFilesToIgnore
            ? options.ignore.map( f => makeFilePath( f ) )
            : [];

        let files: string[] = [];
        // Search for specific files instead of searching in the given directory
        if ( hasFilesToSearch ) {
            // const pStat = promisify( fsStat.stat );

            // const statOptions = {
            //     fs: this._fs,
            //     throwErrorOnBrokenSymbolicLink: false
            // };

            const pAccess = promisify( this._fs.access );

            for ( const file of options.files ) {

                const f: string = makeFilePath( file );

                if ( hasFilesToIgnore
                    && ( options.ignore.includes( file )
                        || options.ignore.includes( f ) ) ) {
                    continue;
                }

                try {
                    // const stats = await pStat( file, statOptions );
                    // if ( ! stats.isFile() ) {
                    //     continue;
                    // }
                    await pAccess( f, this._fs.constants.R_OK );
                } catch ( err ) { // err.code == 'ENOENT'
                    // console.log( err );
                    continue;
                }
                files.push( f );
            }

        } else {
            const pWalk = promisify( fsWalk.walk );

            const fileHasExtension = path => {
                for ( const ext of options.extensions ) {
                    if ( path.endsWith( ext ) ) {
                        return true;
                    }
                }
                return false;
            };

            const entryFilter = entry => {

                // if ( hasFilesToIgnore ) {
                //     console.log( 'IGNORE LIST: ', ignoredFullPath, 'NAME', entry.name, 'PATH', entry.path );
                // }

                if ( ! fileHasExtension( entry.path ) ) {
                    return false;
                }

                const shouldBeIgnored = hasFilesToIgnore &&
                    ignoredFullPath.includes( entry.path );

                if ( shouldBeIgnored ) {
                    return false;
                }

                return true;
            };

            const walkOptions = {
                fs: this._fs,
                // Entry filter
                entryFilter: entryFilter,
                // Skip all ENOENT errors
                errorFilter: error => 'ENOENT' == error.code,
                // Use deep filter when not recursive
                deepFilter: options.recursive ? undefined : entry => options.directory == entry.path
            };
            const entries = await pWalk( options.directory, walkOptions );
            files = entries.map( e => e.path );
        }

        // // Remove ignored files
        // if ( hasFilesToIgnore ) {
        //     for ( let i = files.length - 1; i >= 0; i-- ) {
        //         const file = files[ i ];
        //         if ( options.ignore.includes( file ) ) {
        //             files.splice( i, 1 );
        //         }
        //     }
        // }

        return files;
    }

}