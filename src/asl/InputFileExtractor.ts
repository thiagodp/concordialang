import path = require( 'path' );
import fs = require( 'fs' );
import glob = require( 'glob' );

export class InputFileExtractor {

    private extensions: Array< string >; // extensions without dots

    constructor() {
        this.extensions = [ 'js', 'map' ];
    }

    /**
     * Extract input files according to the command line options.
     * 
     * @param input Input
     * @param flags Flags
     * @return Detected files.
     */
    extract( input: Array< string >, flags: any ): Array< string > {
        let files: Array< string > = [];
        if ( input.length > 0 ) { // dir
            let dir = input[ 0 ];
            let ext = 1 === this.extensions.length
                ? this.extensions[ 0 ]
                : '{' + this.extensions.join( ',' ) + '}';
            let filter = dir + '/**/*.' + ext;
            files = glob.sync( filter );
        } else if ( 'string' === typeof flags.files ) {
            let filesStr = flags.files;
            // Remove quotes arround the given value
            filesStr = filesStr.replace( /^"(.*)"$/, '$1' );
            // Extract files separated by comma
            files = filesStr.split( ',' );
        }
        return files;
    }

}