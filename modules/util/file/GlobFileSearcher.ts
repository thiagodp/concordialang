import * as fg from "fast-glob";

import { FileSearcher, FileSearchOptions } from "./FileSearcher";
import { GlobPatternBuilder } from "./GlobPatternBuilder";

export class GlobFileSearcher implements FileSearcher {

    constructor( private _fs: any ) {
    }

    async searchFrom( options: FileSearchOptions ): Promise< string[] > {

        const patternBuilder = new GlobPatternBuilder();

        let hasFilesToConsider: boolean = options.files.length > 0;
        let hasFilesToIgnore: boolean = options.ignore.length > 0;

        // Remove any files to ignore from the files to consider
        if ( hasFilesToConsider && hasFilesToIgnore ) {

            let removed: boolean = false;

            for ( let i = options.ignore.length - 1; i >= 0; i-- ) {
                const considerIndex = options.files.indexOf( options.ignore[ i ] );
                if ( considerIndex >= 0 ) {
                    options.files.splice( considerIndex, 1 );
                    options.ignore.splice( i, 1 );
                    removed = true;
                }
            }

            if ( removed ) {
                hasFilesToConsider = options.files.length > 0;
                hasFilesToIgnore = options.ignore.length > 0;
            }
        }

        const pattern: string = hasFilesToConsider
            ? patternBuilder.filesWithinDirectory(
                options.files, options.directory, ! options.recursive )
            : patternBuilder.extensionsWithinDirectory(
                options.extensions, options.directory, ! options.recursive );

        // console.log( 'Pattern: ', pattern );

        // const target: string[] = hasFilesToConsider
        //     ? options.files
        //     : pattern.prettyExtensions( options.extensions );

        // Fast glob options
        const fgOptions: fg.Options = { fs: this._fs };
        if ( hasFilesToIgnore ) {
            const ignorePattern = patternBuilder.filesToIgnore( options.ignore );
            fgOptions.ignore = [ ignorePattern ];
            // fgOptions.ignore = options.ignore;
        }
        if ( ! options.recursive ) {
            fgOptions.deep = 1;
        }
        // console.log( 'FAST GLOB:', pattern, "\nignore:", fgOptions.ignore, "\ndeep:", fgOptions.deep );

        return await fg( pattern, fgOptions );
    }

}