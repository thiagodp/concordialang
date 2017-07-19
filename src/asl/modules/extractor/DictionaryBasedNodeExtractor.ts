import { LineChecker } from './LineChecker';
import { ASTNode } from "../ast/ASTNode";
import { ASTNodeExtractor } from "./ASTNodeExtractor";

/**
 * Detects tokens based on a dictionary.
 */
export abstract class DictionaryBasedNodeExtractor < T extends ASTNode > implements ASTNodeExtractor< T > {

    protected _lineChecker: LineChecker = new LineChecker();

    /**
     * @param _words Array of words.
     */
    constructor( private _words: Array< string > ) {
    }

    protected positionInTheLine( line: string ): number {
        let i, pos;
        for ( i in this._words ) {
            pos = this._lineChecker.positionOf( this._words[ i ], line );
            if ( pos >= 0 ) {
                return pos;
            }
        }
        return -1;        
    }

    /** @inheritDoc */
    public isInTheLine( line: string ): boolean {
        return 0 === this.positionInTheLine( line.trim() );
    }

    /** @inheritDoc */
    public abstract extract( line: string, lineNumber: number ): T;    

}