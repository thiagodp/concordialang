"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FSFileSearcher = void 0;
const fsWalk = require("@nodelib/fs.walk");
const path_1 = require("path");
const util_1 = require("util");
class FSFileSearcher {
    constructor(_fs) {
        this._fs = _fs;
    }
    searchFrom(options) {
        return __awaiter(this, void 0, void 0, function* () {
            // Whether the given directory is a file, return it
            const pStat = util_1.promisify(this._fs.stat);
            if (options.directory) {
                const msgNotADirectory = `Directory not found: ${options.directory}`;
                let st;
                try {
                    st = yield pStat(options.directory);
                }
                catch (err) {
                    throw new Error(msgNotADirectory);
                }
                if (!st.isDirectory()) {
                    throw new Error(msgNotADirectory);
                }
            }
            const makeFilePath = file => {
                return path_1.normalize(path_1.join(options.directory, file));
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
                const pAccess = util_1.promisify(this._fs.access);
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
                        yield pAccess(f, this._fs.constants.R_OK);
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
                const pWalk = util_1.promisify(fsWalk.walk);
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
                const entries = yield pWalk(options.directory, walkOptions);
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
        });
    }
}
exports.FSFileSearcher = FSFileSearcher;
