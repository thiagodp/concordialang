import path = require( 'path' );
import fs = require( 'fs' );
import glob = require( 'glob' );
import crypto = require( 'crypto' );

/**
 * Input file extractor
 * 
 * @author  Thiago Delgado Pinto
 */
export class InputFileExtractor {

    /**
     * Returns true if the given directory exists.
     * 
     * @param dir Directory to check.
     */
    directoryExists( dir: string ): boolean {
        return fs.existsSync( dir );
    }

    /**
     * Filter the given files, returning a new list with only the files that match
     * the given extensions.
     * 
     * @param files Files to filter
     * @param extensions Extensions to consider, without dots. E.g.: [ 'txt', 'json' ]
     * @returns Array< string >
     */
    filterFilenames( files: Array< string >, extensions: Array< string > ): Array< string > {
        let filtered: Array< string > = [];
        let ext: string;
        for ( let i in files  ) {
            // Extract the extension and remove the dot
            ext = path.extname( files[ i ] ).replace( '.', '' );
            // If it exists in the list of extensions, add it
            if ( extensions.indexOf( ext ) > 0 ) {
                filtered.push( files[ i ] );
            }
        }
        return filtered;        
    }

    /**
     * Returns the non existent files.
     * 
     * @param files Files to be checked.
     */
    nonExistentFiles( files: Array< string > ): Array< string > {
        let invalid: Array< string > = [];
        for ( let i in files  ) {
            if ( ! fs.existsSync( files[ i ] ) ) {
                invalid.push( files[ i ] );
            }
        }
        return invalid;
    }

    /**
     * Extract files from a directory.
     * 
     * @param dir Directory
     * @param extensions File extensions to filter, without dots (e.g.: [ 'txt', 'json' ]). Optional.
     * @returns Array< string >
     */
    extractFilesFromDirectory( dir: string, extensions?: Array< string > ): Array< string > {
        let filter: string;
        if ( extensions && extensions.length > 0 ) {
            let ext = 1 === extensions.length ? extensions[ 0 ] : '{' + extensions.join( ',' ) + '}';
            filter = dir + '/**/*.' + ext;
        } else {
            filter = dir + '/**/*.*';
        }
        return glob.sync( filter );
    }


    /**
     * Returns a (sha-1) hash for the given file.
     * 
     * @param fileName File name
     */
    hashOfFile( fileName: string, encoding?: string ) {
        const buffer = fs.readFileSync( fileName, encoding ? encoding : null );
        return crypto.createHash( 'sha1' )
            .update( buffer.toString() )
            .digest( 'hex' );
    }


    extractFileName( filePath: string ): string {
        return path.basename( filePath );
    }

    extractFileExtension( file: string ): string {
        return path.extname( file );
    }    

}