/**
 * Document processor
 * 
 * onStart() is always executed.
 * onError() is only executed in case of error (e.g. permission error, read error)
 * onLineRead() is only executed when a line is read.
 * onFinish() is only executed when there are no errors.
 * 
 * @author Thiago Delgado Pinto
 */
export interface DocumentProcessor {

    onStart( name?: string ): void;

    onError( message: string ): void;

    onLineRead( line: string, lineNumber: number ): void;

    onFinish(): void;

}