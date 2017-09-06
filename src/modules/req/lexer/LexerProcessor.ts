import { Finishable } from '../Finishable';
import { DocumentProcessor } from '../DocumentProcessor';
import { Lexer } from "./Lexer";

/**
 * Lexer processor
 * 
 * @author Thiago Delgado Pinto
 */
export class LexerProcessor implements DocumentProcessor {

    constructor( private _lexer: Lexer ) {
    }

    /** @inheritDoc */
    public onStart( name?: string ): void {
        this._lexer.reset();
    }

    /** @inheritDoc */
    public onError( message: string ): void {
        this._lexer.addErrorMessage( message );
    }

    /** @inheritDoc */
    public onLineRead( line: string, lineNumber: number ): void {
        this._lexer.addNodeFromLine( line, lineNumber );
    }

    /** @inheritDoc */
    public onFinish(): void {
        // ?
    }
}