import { FileProcessor } from './FileProcessor';
import { DocumentProcessor } from "./DocumentProcessor";
import fs = require( 'fs' );

/**
 * Sync file processor
 * 
 * @author Thiago Delgado Pinto
 */
export class SyncFileProcessor implements FileProcessor {
    
    constructor( private _encoding = 'utf8' ) {
    }

    /** @inheritDoc */
    public process( file: string, processor: DocumentProcessor ): void {
        let lines: string[];
        processor.onStart( file );
        try {
            lines = fs.readFileSync( file, this._encoding ).split( "\n" );
        } catch ( e ) {
            processor.onError( e.message );
            return;
        }
        let lineNumber = 0;
        for ( let line of lines ) {
            processor.onLineRead( line, ++lineNumber );
        }
        processor.onFinish();
    }

}