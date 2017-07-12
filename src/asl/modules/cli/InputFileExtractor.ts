import path = require( 'path' );
import fs = require( 'fs' );
import glob = require( 'glob' );

export class InputFileExtractor {

    private extensions: Array< string >; // extensions without dots
    private fileSeparator: string;    

    constructor( extensions?: Array< string >, fileSeparator?: string ) {
        this.extensions = ( extensions ? extensions : [ 'feature' ] );
        this.fileSeparator = fileSeparator ? fileSeparator : ',';
    }

    /**
     * Returns true if the given directory exists.
     * 
     * @param dir Directory to check.
     */
    directoryExists( dir: string ): boolean {
        return fs.existsSync( dir );
    }

    /**
     * Returns the invalid files.
     * 
     * @param files Files to be checked.
     */
    checkFiles( files: Array< string > ): Array< string > {
        let invalid: Array< string > = [];
        for ( let i in files  ) {
            if ( ! fs.existsSync( files[ i ] ) ) {
                invalid.push( files[ i ] );
            }
        }
        return invalid;
    }

    /**
     * Extract files from a directory, filtered by the configured extensions.
     * 
     * @param dir Directory
     */
    extractFromDirectory( dir: string ): Array< string > {
        let ext = 1 === this.extensions.length
            ? this.extensions[ 0 ]
            : '{' + this.extensions.join( ',' ) + '}';
        let filter = dir + '/**/*.' + ext;
        return glob.sync( filter );
    }

    /**
     * 
     * @param text Text with the file names, separatted by.
     */
    extractFromText( text: string ): Array< string > {
        // Remove quotes arround the given value
        let files = text.replace( /^"(.*)"$/, '$1' );
        // Extract files separated by fileSeparator (i.e. comma)
        return files.split( this.fileSeparator );        
    }

}