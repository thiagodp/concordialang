import * as fg from "fast-glob";

import { Options } from "../../app/Options";
import { FileSearcher } from "./FileSearcher";
import { GlobPatternBuilder } from "./GlobPatternBuilder";

export class GlobFileSearcher implements FileSearcher {

    constructor( private _fs: any ) {
    }

    async searchFrom( options: Options ): Promise< string[] > {

        const patternBuilder = new GlobPatternBuilder();

        const hasFilesToConsider: boolean = options.files.length > 0;
        const hasFilesToIgnore: boolean = options.ignore.length > 0;

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
            const pattern = patternBuilder.filesToIgnore( options.ignore );
            fgOptions.ignore = [ pattern ];
            // fgOptions.ignore = options.ignore;
        }
        if ( ! options.recursive ) {
            fgOptions.deep = 1;
        }

        return await fg( pattern, fgOptions );
    }

}