import { InputFileExtractor } from './InputFileExtractor';
import cliTruncate = require( 'cli-truncate' );

export class InputProcessor {

    private inputFileExtractor: InputFileExtractor = new InputFileExtractor();
    private defaultExtensions: Array< string > = [ 'asl', 'feature', 'feat' ];    
    private defaultFileEncoding: string = 'UTF-8';
    private defaultParamSeparator: string = ',';

    constructor( private write: Function, private ora: any, private chalk: any ) {
    }

    /**
     * Process an input.
     * 
     * @param input Input
     * @param flags Flags
     */
    process( input: Array< string >, flags: any ): boolean {
        const spinner = this.ora().start( 'Starting...' );
        const ye = this.chalk.yellow;

        // Language
        let language = this.detectLanguage( flags );
        spinner.info( 'Using language ' + ye( language ) );
        spinner.stop();

        // Input files or directory
        let files: Array< string >;
        try {
            files = this.detectFiles( input, flags, spinner, ye );
        } catch ( err ) {
            spinner.fail( err.message );
            return false;
        }

        // Analysing files
        files.forEach( element => {
            this.analyzeFile( element );
        } );

        spinner.succeed( 'Done' );

        return true;
    }

    /**
     * Detect input language.
     * 
     * @param flags Input flags
     */
    detectLanguage( flags: any ): string {
        return 'string' === typeof flags.lang ? flags.lang : 'en';
    }

    /**
     * Detect an input directory or input files.
     * 
     * @param input Input
     * @param flags Flags
     * @param spinner Spinner
     * @param color Function to color text
     */
    detectFiles( input: Array< string >, flags: any, spinner: any, color: any ): Array< string > {
        let files: Array< string >;
        let readableExtensions: string = this.makeReadableExtensions( this.defaultExtensions, color );
        // Input directory was given ?
        if ( 1 == input.length ) {
            let dir = input[ 0 ];
            // Check directory
            if ( ! this.inputFileExtractor.directoryExists( dir ) ) {
                let msg = 'Directory ' + this.chalk.yellow( dir ) + ' does not exist.';
                throw new Error( msg );
            }
            spinner.start( 'Searching for ' + readableExtensions + ' files in "' + color( dir ) + '" ...' );
            // Extract files
            files = this.inputFileExtractor.extractFilesFromDirectory( dir, this.defaultExtensions );
            // Exclude files to ignore
            if ( 'string' === typeof flags.ignore ) {
                // Get ignored files and transform them to lower case
                let ignoreFiles = this.extractValuesFromTextualParameter( flags.ignore, this.defaultParamSeparator )
                    .map( v => v.toLowerCase() );
                // Make a copy of the files and transform them to lower case in order to 
                // compare with the ignored files
                let filesCopy = files.slice().map( v => v.toLowerCase() );
                // Remove ignored files, according to the files copy
                for ( let i in ignoreFiles ) {
                    let pos = filesCopy.indexOf( ignoreFiles[ i ] );
                    if ( pos >= 0 ) {
                        spinner.info( 'Ignoring file "' + color( ignoreFiles[ i ] ) + '"' );
                        // Remove it from the files array
                        files.splice( pos, 1 );
                    }
                }
            }

        // Files flag was given ?
        } else if ( 'string' === typeof flags.files ) {

            // Warn in case of the ignore flag
            if ( 'string' === typeof flags.ignore ) {
                let msg = 'The option ' + color( '--ignore' ) + ' should not be used with ' + color( '--files' )
                    + ' and will be disconsidered.';
                spinner.warn( msg );
            }

            // Extract files
            files = this.extractValuesFromTextualParameter( flags.files, this.defaultParamSeparator )
            // Remove duplicates
            files = Array.from( new Set( files ) );
            // Remove files with invalid extensions
            let lengthBefore: number = files.length;
            files = this.inputFileExtractor.filterFilenames( files, this.defaultExtensions );
            let lengthAfter: number = files.length;
            if ( lengthBefore != lengthAfter ) {
                let diff = lengthBefore - lengthAfter;
                let isPlural = diff > 1;
                let msg = 'Ignoring ' + color( diff  ) + ( isPlural ? ' files' : ' file' )
                    + ' because of ' + ( isPlural ? 'their' : 'its' ) + ' unexpected extension'
                    + ( isPlural ? 's.' : '.' );
                spinner.warn( msg );
            }
            // Check files
            spinner.info( 'Checking ' + color( lengthAfter ) + ' file' + ( lengthAfter > 1 ? 's': '' ) + '...' );
            let nonExistentFiles: Array< string > = this.inputFileExtractor.nonExistentFiles( files );
            if ( nonExistentFiles.length > 0 ) {
                let msg = 'Files not found: ' + color( nonExistentFiles.length ) + "\n";
                for ( let i in nonExistentFiles ) {
                    msg += "\t" + ( parseInt( i ) + 1 ) + ') ' + color( nonExistentFiles[ i ] ) + "\n";
                }
                throw new Error( msg );
            }
        }

        let len = files.length;
        if ( len < 1 ) {
            let msg = 'No ' + readableExtensions + ' files ' + ( 1 === input.length ? 'to consider in "' + color( input[ 0 ] ) + '"' : 'given.' );
            throw new Error( msg );
        }
        spinner.info( 'Reading ' + color( len ) + ' ' + ( len > 1 ? 'files' : 'file' ) + '...' );

        return files;
    }

    /**
     * Returns extensions in a user-readable format.
     * 
     * @param extensions Extensions
     * @param color Function to colorize the extensions.
     * @returns string
     */
    private makeReadableExtensions( extensions: Array< string >, color: Function ): string {
        let ext: string = extensions.slice().map( e => color( '.' + e ) ).join( ', ' );
        if ( ext.length > 1 ) {
            let pos = ext.lastIndexOf( ',' );
            ext = ext.slice( 0, pos ) + ' and' + ext.slice( pos + 1 );
        }
        return ext;
    }

    /**
     * Extract values from a textual parameter.
     * 
     * @param text Text to extract the values.
     * @param separator Separator for the parameters. Optional. Default is ",".
     * @returns Array< string >
     */
    extractValuesFromTextualParameter( text: string, separator?: string ): Array< string > {
        // Remove quotes arround the given value
        let params = text.replace( /^"(.*)"$/, '$1' );
        // Extract parameters separated by a separator (i.e. comma)
        return params.split( separator ? separator : ',' );
    }    


    analyzeFile( file: string ) {
        let columns = process.stdout.columns || 80;
        let fileHash = this.inputFileExtractor.hashOfFile( file, this.defaultFileEncoding );
        let hashText = ' (' + fileHash.substr( 0, 7 ) + ')';
        let fileText = this.chalk.gray( cliTruncate( '  ' + file,
            ( columns - hashText.length ), { position: 'middle' } ) );
        this.write( fileText + hashText );
    }

}