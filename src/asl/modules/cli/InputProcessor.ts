import { isArray } from 'util';

import { InputFileExtractor } from './InputFileExtractor';

export class InputProcessor {

    private inputFileExtractor: InputFileExtractor;

    constructor( private write: Function, private ora: any, private chalk: any ) {
        this.inputFileExtractor = new InputFileExtractor();
    }

    process( input: Array< string >, flags: any ): boolean {
        /*
        this.writeFn( 'Input:' );
        this.writeFn( input );
        this.writeFn( 'Flags:' );
        this.writeFn( flags );
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

        //
        // Language
        let language = ( 'string' === typeof flags.lang ? flags.lang : 'en' );
        spinner.info( 'Using language ' + ye( language ) );

        //
        // Input files or directory
        spinner.stop();
        let files: Array< string >;
        // Input directory was given ?
        if ( 1 == input.length ) {
            let dir = input[ 0 ];
            // Check directory
            if ( ! this.inputFileExtractor.directoryExists( dir ) ) {
                spinner.fail( 'Directory ' + this.chalk.yellow( dir ) + ' does not exist.' );
                return false;
            }
            spinner.start( 'Detecting files in "' + ye( dir ) + '" ...' );
            // Extract files
            files = this.inputFileExtractor.extractFromDirectory( dir );
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
                    msg += "\t" + ( parseInt( i ) + 1 ) + ') ' + ye( incorrectFiles[ i ] ) + "\n";
                }
                spinner.fail( msg );
                return false;
            }
        }

        let len = files.length;
        if ( len < 1 ) {
            let msg = 'No files ' + ( 1 === input.length ? 'detected in "' + ye( input[ 0 ] ) + '"' : 'given.' );
            spinner.fail( msg );
            return false;
        }
        spinner.info( 'Reading ' + ye( len ) + ' ' + ( len > 1 ? 'files' : 'file' ) + '...' );

        // Analysing files
        files.forEach( element => {
            this.write( element );
        });

        spinner.succeed( 'Done' );

        return true;
    }

}