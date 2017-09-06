import { ProcessingObserver } from './ProcessingObserver';
import { RequirementFilesProcessor } from './RequirementFilesProcessor';
import { InputFileExtractor } from '../util/InputFileExtractor';
import cliTruncate = require('cli-truncate');

/**
 * Input processor
 * 
 * @author Thiago Delgado Pinto
 */
export class InputProcessor implements ProcessingObserver {

    private _inputFileExtractor: InputFileExtractor = new InputFileExtractor();
    private _defaultExtensions: Array< string > = [ 'asl', 'feature', 'feat' ];    
    private _defaultFileEncoding: string = 'UTF-8';
    private _defaultParamSeparator: string = ',';
    private _reqProcessor: RequirementFilesProcessor;

    private _spinnersMap: Object = {};

    constructor( private _write: Function, private _ora: any, private _chalk: any ) {
        this._reqProcessor = new RequirementFilesProcessor( _write );
    }

    /**
     * Process an input.
     * 
     * @param input Input
     * @param flags Flags
     */
    process( input: Array< string >, flags: any ): boolean {
        const spinner = this._ora().start( 'Starting...' );
        const ye = this._chalk.yellow;

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

        // Processing files
        this._reqProcessor.process( files, this );

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
        let readableExtensions: string = this.makeReadableExtensions( this._defaultExtensions, color );
        // Input directory was given ?
        if ( 1 == input.length ) {
            let dir = input[ 0 ];
            // Check directory
            if ( ! this._inputFileExtractor.directoryExists( dir ) ) {
                let msg = 'Directory ' + this._chalk.yellow( dir ) + ' does not exist.';
                throw new Error( msg );
            }
            spinner.start( 'Searching for ' + readableExtensions + ' files in "' + color( dir ) + '" ...' );
            // Extract files
            files = this._inputFileExtractor.extractFilesFromDirectory( dir, this._defaultExtensions );
            // Exclude files to ignore
            if ( 'string' === typeof flags.ignore ) {
                // Get ignored files and transform them to lower case
                let ignoreFiles = this.extractValuesFromTextualParameter( flags.ignore, this._defaultParamSeparator )
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
            files = this.extractValuesFromTextualParameter( flags.files, this._defaultParamSeparator )
            // Remove duplicates
            files = Array.from( new Set( files ) );
            // Remove files with invalid extensions
            let lengthBefore: number = files.length;
            files = this._inputFileExtractor.filterFilenames( files, this._defaultExtensions );
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
            let nonExistentFiles: Array< string > = this._inputFileExtractor.nonExistentFiles( files );
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


    printFileInfo( file: string ) {
        return this._ora( this.makeFileInfo( file ) ).start();
    }

    private makeFileInfo( file: string ): string {
        let columns = process.stdout.columns || 80;
        let fileHash = this._inputFileExtractor.hashOfFile( file, this._defaultFileEncoding );
        let hashPiece = ' (' + fileHash.substr( 0, 7 ) + ')';
        let truncatedFileName = this._chalk.white(
            cliTruncate( '  ' + file, ( columns - hashPiece.length ), { position: 'middle' } )
            );
        return truncatedFileName + hashPiece;
    }

    /** @inheritDoc */
    public onStarted( filePath: string ): void {
        this._spinnersMap[ filePath ] = this.printFileInfo( filePath );
    }

    /** @inheritDoc */
    public onError( filePath: string, errors: Error[] ): void {

        const hasSpinner = this._spinnersMap[ filePath ] !== undefined;
        
        if ( hasSpinner ) {
            let fileInfo = this.makeFileInfo( filePath );
            this._spinnersMap[ filePath ].fail( fileInfo );
        }        
            
        for ( let error of errors ) {
            let content = this._chalk.red( "\t" + error.message );
            if ( hasSpinner ) {
                this._spinnersMap[ filePath ].warn( content );
            } else {
                this._write( content );
            }
        }        
    }    
    
    /** @inheritDoc */
    public onFinished( filePath: string, succeeded: boolean ): void {
        if ( ! this._spinnersMap[ filePath ] ) {
            return;
        }
        let fileInfo = this.makeFileInfo( filePath );
        if ( succeeded ) {
            this._spinnersMap[ filePath ].succeed( fileInfo );
        }
    }
}