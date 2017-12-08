import { ProcessingObserver } from './ProcessingObserver';
import { RequirementFilesProcessor } from './RequirementFilesProcessor';
import { FileUtil } from '../util/FileUtil';
import cliTruncate = require('cli-truncate');
import { FileInfo } from "../ast/FileInfo";

/**
 * Input processor
 * 
 * @author Thiago Delgado Pinto
 */
export class InputProcessor implements ProcessingObserver {

    private _fileUtil: FileUtil = new FileUtil();
    private _defaultExtensions: Array< string > = [ 'asl', 'feature', 'feat' ];
    private _defaultParamSeparator: string = ',';
    private _reqProcessor: RequirementFilesProcessor;

    private MAIN_SPINNER_KEY: string = '*'; // "const"    
    private _spinnersMap: Object = {};
    private _totalErrors: number = 0;
    private _totalWarnings: number = 0;

    constructor( private _write: Function, private _ora: any, private _chalk: any ) {
        this._reqProcessor = new RequirementFilesProcessor( _write );
        this.makeSpinner( this.MAIN_SPINNER_KEY );
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
        if ( this.availableLanguages().indexOf( language ) < 0 ) {
            spinner.warn( 'Language ' + ye( language ) + ' not available. Available are: ' +
                this.availableLanguages().join( ', ' ) + '.' );
            language = 'en';
        }

        // Encoding
        let encoding = this.detectEncoding( flags );
        if ( this.availableEncodings().indexOf( encoding ) < 0 ) {
            let available: string = Array.from( new Set( this.availableEncodings().map( v => v.replace( '-', '' ) ) ) )
                .join( ', ' );
            spinner.warn( 'Encoding ' + ye( encoding ) + ' not available. Available are: ' + available + '.' );
            encoding = 'utf8';
        }        

        spinner.info( 'Using language ' + ye( language ) + ' and encoding ' + ye( encoding ) + '.' );
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
        const basePath = 1 === input.length ? input[ 0 ] : null;        
        this._reqProcessor.process( basePath, files, language, encoding, this );

        if ( 0 === this._totalErrors ) {
            spinner.succeed( 'Done' );
        } else {
            spinner.info( 'Errors found: ' + this._chalk.red( this._totalErrors ) );
        }

        return true;
    }

    /**
     * Detect input charset.
     * 
     * @param flags Input flags
     */    
    detectEncoding( flags: any ): string {
        let charset = 'string' === typeof flags.encoding ? flags.encoding : 'utf8';
        return charset.trim().toLowerCase().replace( '-', '' );
    }

    /**
     * Detect input language.
     * 
     * @param flags Input flags
     */
    detectLanguage( flags: any ): string {
        let language: string = 'string' === typeof flags.language ? flags.language : 'en';
        return language.trim().toLowerCase();
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
            if ( ! this._fileUtil.directoryExists( dir ) ) {
                let msg = 'Directory ' + this._chalk.yellow( dir ) + ' does not exist.';
                throw new Error( msg );
            }
            spinner.start( 'Searching for ' + readableExtensions + ' files in "' + color( dir ) + '" ...' );
            // Extract files
            files = this._fileUtil.extractFilesFromDirectory( dir, this._defaultExtensions );
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
            files = this._fileUtil.filterFilenames( files, this._defaultExtensions );
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
            let nonExistentFiles: Array< string > = this._fileUtil.nonExistentFiles( files );
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
     * Returns available languages.
     */
    private availableLanguages(): string[] {
        return [ 'en', 'pt' ]; // TO-DO: detect files
    }

    /**
     * Returns available encodings.
     * 
     * @see https://github.com/nodejs/node/blob/master/lib/buffer.js
     */
    private availableEncodings(): string[] {
        return [
            'utf8', 'utf-8',
            'ascii',
            'latin1',
            'ucs2', 'ucs-2',
            'utf16le', 'utf-16le'
        ];
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
    private extractValuesFromTextualParameter( text: string, separator?: string ): Array< string > {
        // Remove quotes arround the given value
        let params = text.replace( /^"(.*)"$/, '$1' );
        // Extract parameters separated by a separator (i.e. comma)
        return params.split( separator ? separator : ',' );
    }

    private makeSpinner( key: string, value?: string ) {
        this._spinnersMap[ key ] = this._ora();
        if ( value ) {
            this._spinnersMap[ key ].start( value );
        }
    }

    private makeSpinnerFromFileInfo( fileInfo: FileInfo ) {
        return this.makeSpinner( fileInfo.path, this.formatFileInfo( fileInfo ) );
    }

    private spinnerWithKey( key: string ): any {
        return this._spinnersMap[ key ];
    }

    private spinnerWithFileInfo( fileInfo: FileInfo ): any {
        return this.spinnerWithKey( fileInfo.path );
    }
    
    private mainSpinner(): any {
        return this.spinnerWithKey( this.MAIN_SPINNER_KEY );
    }    

    private formatFileInfo( fileInfo: FileInfo ): string {
        let columns = process.stdout.columns || 80;
        let fileHash = fileInfo.hash || '';
        let hashPiece = ' (' + fileHash.substr( 0, 7 ) + ')';
        let truncatedFileName = this._chalk.white(
            cliTruncate( '  ' + fileInfo.path, ( columns - hashPiece.length ), { position: 'middle' } )
            );
        return truncatedFileName + hashPiece;
    }

    /** @inheritDoc */
    public onFileStarted( fileInfo: FileInfo ): void {
        this.makeSpinnerFromFileInfo( fileInfo );
    }

    /** @inheritDoc */
    public onFileError( fileInfo: FileInfo, errors: Error[] ): void {
        this._totalErrors += errors.length;
        const spinner = this.spinnerWithFileInfo( fileInfo );
        if ( spinner ) {
            spinner.fail( this.formatFileInfo( fileInfo ) );
        }
        this.printErrors( spinner, errors );
    }
    
    /** @inheritDoc */
    public onFileWarning( fileInfo: FileInfo, warnings: Error[] ): void {
        this._totalWarnings += warnings.length;        
        const spinner = this.spinnerWithFileInfo( fileInfo );
        if ( spinner ) {
            spinner.fail( this.formatFileInfo( fileInfo ) );
        }
        this.printWarnings( spinner, warnings );
    }    
    
    /** @inheritDoc */
    public onFileFinished( fileInfo: FileInfo, succeeded: boolean ): void {
        const spinner = this.spinnerWithFileInfo( fileInfo );
        if ( succeeded && spinner ) {
            spinner.succeed( this.formatFileInfo( fileInfo ) );
        }
    }

    /** @inheritDoc */
    public onError( errors: Error[] ): void {
        this.printErrors( this.mainSpinner(), errors, '' );
    }

    private printErrors( spinner: any, errors: Error[], prefix: string = "   " ): void {
        for ( let error of errors ) {
            let content = this._chalk.red( prefix + error.message );
            if ( spinner ) {
                spinner.warn( content );
            } else {
                this._write( content );
            }
        }        
    }

    private printWarnings( spinner: any, warnings: Error[], prefix: string = "   " ): void {
        for ( let warn of warnings ) {
            let content = this._chalk.yellow( prefix + warn.message );
            if ( spinner ) {
                spinner.warn( content );
            } else {
                this._write( content );
            }
        }        
    }    
}