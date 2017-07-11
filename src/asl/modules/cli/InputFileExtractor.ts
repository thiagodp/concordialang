import path = require( 'path' );
import fs = require( 'fs' );
import glob = require( 'glob' );

export class InputFileExtractor {

    private extensions: Array< string >; // extensions without dots

    constructor( extensions?: Array< string > ) {
        this.extensions = ( extensions ? extensions : [ 'js', 'map' ] );
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
        // Handles the directory given. E.g.: $ asm path/to/dir
        if ( input.length > 0 ) { // dir
            let dir = input[ 0 ];
            let ext = 1 === this.extensions.length
                ? this.extensions[ 0 ]
                : '{' + this.extensions.join( ',' ) + '}';
            let filter = dir + '/**/*.' + ext;
            files = glob.sync( filter );

        // Handles flags such as: $ asm --files="path/to/f1.feature,other/f2.feature"
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