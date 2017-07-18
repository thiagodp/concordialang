import fs = require('fs');
import readline = require('readline');
import { LineBasedProcessor } from "./LineBasedProcessor";

export class FileProcessor {

    private _lineNumber: number = 0;

    constructor( private _encoding = 'utf8' ) {
    }

    /**
     * Process a file, line-by-line.
     * 
     * @param file Input file.
     * @param processor Line based processor.
     */
    process(
        file: string,
        processor: LineBasedProcessor
    ) {
        let readStream = fs.createReadStream( file );
        readStream.setEncoding( this._encoding );

        const rl = readline.createInterface( { input: readStream } as any );

        rl.on( 'error', processor.onError );

        rl.on( 'line', ( line ) => {
            processor.onRead( line, ++this._lineNumber );
        } );

        rl.on( 'close', () => {
            this._lineNumber = 0;
            processor.onFinish();
        } );
    }

}