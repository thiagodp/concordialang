import { isArray } from 'util';

import { InputFileExtractor } from './InputFileExtractor';

export class InputProcessor {

    private inputFileExtractor: InputFileExtractor;

    constructor( private write: Function, private ora: any, private chalk: any ) {
        this.inputFileExtractor = new InputFileExtractor();
    }

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


    detectLanguage( flags: any ): string {
        return 'string' === typeof flags.lang ? flags.lang : 'en';
    }

    
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
            files = this.inputFileExtractor.extractFromDirectory( dir );
            // Exclude files to ignore
            if ( 'string' === typeof flags.ignore ) {
                // Get ignored files and transform them to lower case
                let ignoreFiles = this.inputFileExtractor.extractFromText( flags.ignore )
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
            // Extract files
            files = this.inputFileExtractor.extractFromText( flags.files );
            // Remove duplicates
            files = Array.from( new Set( files ) );
            // Check files
            spinner.info( 'Checking files...' );
            let incorrectFiles: Array< string > = this.inputFileExtractor.checkFiles( files );
            if ( incorrectFiles.length > 0 ) {
                let msg = "Invalid files given: \n";
                for ( let i in incorrectFiles ) {
                    msg += "\t" + ( parseInt( i ) + 1 ) + ') ' + color( incorrectFiles[ i ] ) + "\n";
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

}