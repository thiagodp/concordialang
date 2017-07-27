import { Document } from "../ast/Document";

/**
 * Document processor
 * 
 * onStart() and onFinish() are always executed.
 * onError() is only executed in case of error (e.g. permission error, read error)
 * onLineRead() is only executed when a line is read.
 */
export interface DocumentProcessor {

    onStart(): void;

    onError( message: string ): void;

    onLineRead( line: string, lineNumber: number ): void;

    onFinish(): void;


    errors(): Array< Error >;

    result(): Document;

}