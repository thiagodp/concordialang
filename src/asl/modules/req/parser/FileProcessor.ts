import fs = require('fs');
import readline = require('readline');
import { DocumentProcessor } from "./DocumentProcessor";

export class FileProcessor {

    private _lineNumber: number = 0;

    constructor( private _encoding = 'utf8' ) {
    }

    /**
     * Use a processor to process a file, line-by-line.
     * 
     * @param file Input file.
     * @param processor Processor.
     */
    public process( file: string, processor: DocumentProcessor ): void {
        
        let readStream = fs.createReadStream( file );
        readStream.setEncoding( this._encoding );

        const rl = readline.createInterface( { input: readStream } as any );

        processor.onStart( file );

        rl.on( 'error', processor.onError );

        rl.on( 'line', ( line ) => {
            processor.onLineRead( line, ++this._lineNumber );
        } );

        rl.on( 'close', () => {
            this._lineNumber = 0;
            processor.onFinish();
        } );
    }

}