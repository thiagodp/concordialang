import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';
import * as crypto from 'crypto';
import * as util from 'util';

/**
 * File utilities.
 * 
 * @author  Thiago Delgado Pinto
 */
export class FileUtil {

    constructor( private _fs: any = fs ) {
    }

    /**
     * Returns true if the given directory exists.
     * 
     * @param dir Directory to check.
     */
    directoryExists( dir: string ): boolean {
        return this._fs.existsSync( dir );
    }

    /**
     * Ensures a directory existence, creating any parent directory if needed.
     * 
     * @author Matheus Eller Fagundes
     * 
     * @param dirPath Path of the directory.
     */
    ensureDirectory( dirPath ): void {
        let dirname = path.dirname( dirPath );
        if ( this._fs.existsSync( dirname ) ) {
            return;
        }
        this.ensureDirectory( dirname );
        this._fs.mkdirSync( dirname );
    }

    /**
     * Create a file with given content to a file. Output directory is created if needed.
     * 
     * @param content Content to be written.
     * @param outputDirectory Directory to save the file.
     * @param fileName File name.
     * @param fileExtension File extension.
     * 
     * @return A promise with the file path.
     */
    async createFile(
        content: string,
        outputDirectory: string,
        fileName: string,
        fileExtension: string
    ): Promise< string > {
        const writeFile = util.promisify( this._fs.writeFile );
        let filePath: string = path.join( outputDirectory, fileName + '.' + fileExtension );
        this.ensureDirectory( filePath );
        const ok = await writeFile( filePath, content );
        return filePath;
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
            if ( ! this._fs.existsSync( files[ i ] ) ) {
                invalid.push( files[ i ] );
            }
        }
        return invalid;
    }

    /**
     * Returns true if the given file exists.
     * 
     * @param path File path.
     */
    fileExist( path: string ): boolean {
        return this._fs.existsSync( path );
    }

    /**
     * Extract files from a directory.
     * 
     * @param dir Directory
     * @param extensions File extensions to filter, without dots (e.g.: [ 'txt', 'json' ]). Optional.
     * @param recursively If it should find files recursively. Optional. Default true.
     * @returns Array< string >
     */
    extractFilesFromDirectory(
        dir: string,
        extensions?: Array< string >,
        recursively: boolean = true
    ): Array< string > {
        let filter: string = dir + ( recursively ? '/**/' : '/' );
        if ( extensions && extensions.length > 0 ) {
            extensions = extensions.map( e => e.replace( '.', '' ) ); // Remove dots
            let ext = 1 === extensions.length ? extensions[ 0 ] : '{' + extensions.join( ',' ) + '}';
            filter += '*.' + ext;
        } else {
            filter += '*.*';
        }
        return glob.sync( filter );
    }

    /**
     * Returns a (sha-1) hash for the given file.
     * 
     * @param fileName File name
     */
    hashOfFile( fileName: string, encoding?: string ) {
        const buffer = this._fs.readFileSync( fileName, encoding ? encoding : null );
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
