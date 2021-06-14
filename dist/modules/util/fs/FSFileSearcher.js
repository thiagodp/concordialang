import * as fsWalk from '@nodelib/fs.walk';
import { join, normalize } from 'path';
import { promisify } from 'util';
export class FSFileSearcher {
    constructor(_fs) {
        this._fs = _fs;
    }
    async searchFrom(options) {
        // Whether the given directory is a file, return it
        const pStat = promisify(this._fs.stat);
        if (options.directory) {
            const msgNotADirectory = `Directory not found: ${options.directory}`;
            let st;
            try {
                st = await pStat(options.directory);
            }
            catch (err) {
                throw new Error(msgNotADirectory);
            }
            if (!st.isDirectory()) {
                throw new Error(msgNotADirectory);
            }
        }
        const makeFilePath = file => {
            return normalize(join(options.directory, file));
        };
        const fileHasValidExtension = path => {
            for (const ext of options.extensions) {
                if (path.endsWith(ext)) {
                    return true;
                }
            }
            return false;
        };
        const hasFilesToSearch = options.file.length > 0;
        const hasFilesToIgnore = options.ignore.length > 0;
        const ignoredFullPath = hasFilesToIgnore
            ? options.ignore.map(f => makeFilePath(f))
            : [];
        let files = [];
        let warnings = [];
        // Search for specific files instead of searching in the given directory
        if (hasFilesToSearch) {
            // const pStat = promisify( fsStat.stat );
            // const statOptions = {
            //     fs: this._fs,
            //     throwErrorOnBrokenSymbolicLink: false
            // };
            const pAccess = promisify(this._fs.access);
            for (const file of options.file) {
                const f = makeFilePath(file);
                if (hasFilesToIgnore
                    && (options.ignore.includes(file)
                        || options.ignore.includes(f))) {
                    continue;
                }
                if (!fileHasValidExtension(file)) {
                    warnings.push(`Ignored file "${file}".`);
                    continue;
                }
                try {
                    // const stats = await pStat( file, statOptions );
                    // if ( ! stats.isFile() ) {
                    //     continue;
                    // }
                    await pAccess(f, this._fs.constants.R_OK);
                }
                catch (err) { // err.code == 'ENOENT'
                    // console.log( err );
                    warnings.push(`Could not access file "${file}".`);
                    continue; // Ignores the file
                }
                files.push(f);
            }
        }
        else {
            const pWalk = promisify(fsWalk.walk);
            const entryFilter = entry => {
                // if ( hasFilesToIgnore ) {
                //     console.log( 'IGNORE LIST: ', ignoredFullPath, 'NAME', entry.name, 'PATH', entry.path );
                // }
                if (!fileHasValidExtension(entry.path)) {
                    return false;
                }
                const shouldBeIgnored = hasFilesToIgnore &&
                    ignoredFullPath.includes(entry.path);
                if (shouldBeIgnored) {
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
            const entries = await pWalk(options.directory, walkOptions);
            files = entries.map(e => e.path);
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
        return { files: files, warnings: warnings };
    }
}
