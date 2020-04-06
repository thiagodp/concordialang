import * as fsWalk from '@nodelib/fs.walk';
import { promisify } from "util";
import { DirSearcher, DirSearchOptions } from './DirSearcher';

export class FSDirSearcher implements DirSearcher {

    constructor( private readonly _fs: any ) {
    }

    /** @inheritDoc */
    async search( options: DirSearchOptions ): Promise< string[] > {

        const entryFilter = entry => {
            return entry.dirent.isDirectory()
                && options.regexp.test( entry.name );
        }

        const walkOptions = {
            fs: this._fs,
            followSymbolicLinks: true,
            throwErrorOnBrokenSymbolicLink: false,
            // Entry filter
            entryFilter: entryFilter,
            // Skip all ENOENT errors
            errorFilter: error => 'ENOENT' == error.code,
            // Use deep filter when not recursive
            deepFilter: options.recursive ? undefined : entryFilter
        };

        const pWalk = promisify( fsWalk.walk );
        const entries = await pWalk( options.directory, walkOptions );
        return entries.map( e => e.path );
    }

}