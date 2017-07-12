import { isArray } from 'util';

import { InputFileExtractor } from './InputFileExtractor';

export class InputProcessor {

    private inputFileExtractor: InputFileExtractor = new InputFileExtractor();
    private paramSeparator: string = ',';

    constructor( private write: Function, private ora: any, private chalk: any ) {
    }

    /**
     * Process an input.
     * 
     * @param input Input
     * @param flags Flags
     */
    process( input: Array< string >, flags: any ): boolean {
        /*
        this.write( 'Input:' );  this.write( input );
        this.write( 'Flags:' );  this.write( flags );
        */
        /*
        const spinner = ora( 'Loading files' ).start();

        setTimeout(() => {
            spinner.color = 'yellow';
            spinner.text = 'Loading rainbows';
        }, 1000);
        */

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
            this.write( "  " + this.chalk.gray( element ) );
        });

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
        // Input directory was given ?
        if ( 1 == input.length ) {
            let dir = input[ 0 ];
            // Check directory
            if ( ! this.inputFileExtractor.directoryExists( dir ) ) {
                let msg = 'Directory ' + this.chalk.yellow( dir ) + ' does not exist.';
                throw new Error( msg );
            }
            spinner.start( 'Detecting files in "' + color( dir ) + '" ...' );
            // Extract files
            files = this.inputFileExtractor.extractFilesFromDirectory( dir );
            // Exclude files to ignore
            if ( 'string' === typeof flags.ignore ) {
                // Get ignored files and transform them to lower case
                let ignoreFiles = this.extractParametersFromText( flags.ignore, this.paramSeparator )
                    .map( v => v.toLowerCase() );
                // Make a copy of the files and transform them to lower case in order to 
                // compare with the ignored files
                let filesCopy = files.slice().map( v => v.toLowerCase() );
                // Remove ignored files, according to the files copy
                for ( let i in ignoreFiles ) {
                    let pos = filesCopy.indexOf( ignoreFiles[ i ] );
                    if ( pos >= 0 ) {
                        spinner.info( 'Ignoring file "' + color( ignoreFiles[ i ] ) + '"' );
                        files.splice( pos, 1 );
                    }
                }
            }

        // Files flag was given ?
        } else if ( 'string' === typeof flags.files ) {

            // Warn in case of the ignore flag
            if ( 'string' === typeof flags.ignore ) {
                spinner.warn( 'The option ' + color( '--ignore' ) + ' should not be used with ' + color( '--files' )
                    + ' and will be disconsidered.' );
            }

            // Extract files
            files = this.extractParametersFromText( flags.files, this.paramSeparator )
            // Remove duplicates
            files = Array.from( new Set( files ) );
            // Check files
            spinner.info( 'Checking files...' );
            let nonExistentFiles: Array< string > = this.inputFileExtractor.nonExistentFiles( files );
            if ( nonExistentFiles.length > 0 ) {
                let msg = "Invalid files given: \n";
                for ( let i in nonExistentFiles ) {
                    msg += "\t" + ( parseInt( i ) + 1 ) + ') ' + color( nonExistentFiles[ i ] ) + "\n";
                }
                throw new Error( msg );
            }
        }

        let len = files.length;
        if ( len < 1 ) {
            let msg = 'No files ' + ( 1 === input.length ? 'to consider in "' + color( input[ 0 ] ) + '"' : 'given.' );
            throw new Error( msg );
        }
        spinner.info( 'Reading ' + color( len ) + ' ' + ( len > 1 ? 'files' : 'file' ) + '...' );

        return files;
    }

    /**
     * Extract parameters.
     * 
     * @param text Text with the file names, separatted by.
     */
    extractParametersFromText( text: string, separator?: string ): Array< string > {
        // Remove quotes arround the given value
        let params = text.replace( /^"(.*)"$/, '$1' );
        // Extract parameters separated by a separator (i.e. comma)
        return params.split( separator ? separator : ',' );
    }    

}