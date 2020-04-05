import * as fs from 'fs';
import { promisify } from 'util';
import { ReadFileAsyncOptions } from '../ReadFileAsyncOptions';

export const DEFAULT_OPTIONS: ReadFileAsyncOptions = {
	fs: fs,
	encoding: "utf8",
	flag: "r",
	silentIfNotExists: false
};

export async function readFileAsync(
    path: string,
    options?: ReadFileAsyncOptions
): Promise< string | null > {
    const opt: ReadFileAsyncOptions = Object.assign( DEFAULT_OPTIONS, options || {} );
    const readF = promisify( opt.fs.readFile );
    try {
        return await readF( path, { encoding: opt.encoding, flag: opt.flag } );
    } catch ( err ) {
        if ( 'ENOENT' == err.code && options.silentIfNotExists ) {
            return null;
        }
        throw err;
    }
}