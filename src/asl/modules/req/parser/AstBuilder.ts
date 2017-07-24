import { FileProcessor } from './FileProcessor';
import { DocumentProcessor } from "./DocumentProcessor";

export class ASTBuilder {

    constructor( private _docProcessor: DocumentProcessor ) {
    }

    build( file: string ) {
        let processor: FileProcessor = new FileProcessor();
        processor.process( file, this._docProcessor );
    }
    
}