import * as fsWalk from '@nodelib/fs.walk';
import { promisify } from "util";
import { DirSearcher, DirSearchOptions } from './DirSearcher';

export class FSDirSearcher implements DirSearcher {

    constructor( private readonly _fs: any ) {
    }

    /** @inheritDoc */
    async search( options: DirSearchOptions ): Promise< string[] > {

        // // Whether the given directory is a file, return it
        // const pStat = promisify( this._fs.stat );
        // const st = await pStat( options.directory );
        // if ( ! st.isDirectory() ) {
        //     throw new Error( 'Please inform a directory. For files, use --files.' );
        // }

        const entryFilter = entry => {
            return entry.dirent.isDirectory()
                && options.regexp.test( entry.name );
        }

		// @see https://www.npmjs.com/package/@nodelib/fs.walk#options
        const walkOptions = {
            fs: this._fs,
            followSymbolicLinks: true,
            throwErrorOnBrokenSymbolicLink: false,
            // Entry filter
            entryFilter: entryFilter,
            // Skip all ENOTDIR or ENOENT errors
            errorFilter: error => 'ENOTDIR' == error.code || 'ENOENT' == error.code,
            // Use deep filter when *not* recursive
            deepFilter: options.recursive ? undefined : entryFilter
        };

        const pWalk = promisify( fsWalk.walk );
        const entries = await pWalk( options.directory, walkOptions );
        return entries.map( e => e.path );
    }

}
