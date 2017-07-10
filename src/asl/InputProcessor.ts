import { InputFileExtractor } from './InputFileExtractor';

export class InputProcessor {

    private inputFileExtractor: InputFileExtractor;

    constructor( private writeFn: Function, private ora: any ) {
        this.inputFileExtractor = new InputFileExtractor();
    }

    process( input: Array< string >, flags: any ): boolean {
        this.writeFn( 'Input:' );
        this.writeFn( input );
        this.writeFn( 'Flags:' );
        this.writeFn( flags );
        /*
        const spinner = ora( 'Loading files' ).start();

        setTimeout(() => {
            spinner.color = 'yellow';
            spinner.text = 'Loading rainbows';
        }, 1000);
        */
        const spinner = this.ora( 'Detecting files...' ).start();
        let files: Array< string > = this.inputFileExtractor.extract( input, flags );
        let len = files.length;
        if ( len < 1 ) {
            let msg = 'No files ' +
                ( 1 === input.length ? 'detected for the directory "' + input[ 0 ] + '".' : 'given.' );
            spinner.fail( msg );
            return false;
        }
        spinner.info( 'Analyzing ' + len + ' files...' );
        spinner.succeed( 'Done' );
    }

}