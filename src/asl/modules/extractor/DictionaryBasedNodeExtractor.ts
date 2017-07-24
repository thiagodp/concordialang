import { LineChecker } from './LineChecker';
import { ASTNode } from "../ast/ASTNode";
import { ASTNodeExtractor } from "./ASTNodeExtractor";

export interface DictionaryBasedOptions {
    words: Array< string >,
    separator?: string
}

/**
 * Detects tokens based on a dictionary.
 */
export abstract class DictionaryBasedNodeExtractor < T extends ASTNode > implements ASTNodeExtractor< T > {

    protected _lineChecker: LineChecker = new LineChecker();

    constructor( private _options: DictionaryBasedOptions ) {
    }

    protected options(): DictionaryBasedOptions {
        return this._options;
    }

    protected wordPositionInTheLine( line: string ): number {
        let i, pos, words = this._options.words;
        for ( i in words ) {
            pos = this._lineChecker.caseInsensitivePositionOf( words[ i ], line );
            if ( pos >= 0 ) {
                return pos;
            }
        }
        return -1; 
    }

    /** @inheritDoc */
    public isInTheLine( line: string ): boolean {
        let trimmedLine = line.trim();
        let pos = this.wordPositionInTheLine( trimmedLine );
        if ( this._options.separator ) {
            let posSeparator = trimmedLine.indexOf( this._options.separator );
            return 0 === pos && posSeparator > pos;
        }
        return 0 === pos;
    }

    /** @inheritDoc */
    public abstract extract( line: string, lineNumber: number ): T;    

}