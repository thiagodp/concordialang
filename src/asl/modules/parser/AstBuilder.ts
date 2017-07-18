import { FileProcessor } from './FileProcessor';
import { LineBasedProcessor } from "./LineBasedProcessor";

export class AstBuilder {

    constructor(
        private _lineBasedProcessor: LineBasedProcessor
    ) {
    }

    build( file: string ) {
        let processor: FileProcessor = new FileProcessor();
        processor.process( file, this._lineBasedProcessor );
    }
    
}