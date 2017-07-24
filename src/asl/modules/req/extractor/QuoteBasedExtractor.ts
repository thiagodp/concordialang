import { Symbols } from '../../extractor/Symbols';
import { ASTNode } from '../ast/ASTNode';
import { ASTNodeExtractor, TokenDetection } from './ASTNodeExtractor';
import { Expressions } from './Expressions';
import { LineChecker } from './LineChecker';
import { Symbols } from './Symbols';


export class QuoteBasedExtractor< T extends ASTNode > implements ASTNodeExtractor< T >  {

    private _lineChecker: LineChecker = new LineChecker();

    constructor( private _words: Array< string >, private _keyword: string ) {
    }

    private makeRegexForTheWord( word: string ): string {
        return '^' + Expressions.SPACES_OR_TABS
            + '(?:' + word + ')'
            + Expressions.SPACES_OR_TABS
            + '("[^"\r\n]*")';
    }

    /** @inheritDoc */
    public detect( line: string ): TokenDetection | null {
        let word;
        for ( let i in this._words ) {
            word = this._words[ i ];
            let exp = new RegExp( this.makeRegexForTheWord( word ), "iu" );
            let result = exp.exec( line );
            if ( result ) {
                return {
                    keyword: word,
                    position: this._lineChecker.caseInsensitivePositionOf( word, line )
                };
            }
        }
        return null;
    }

    /** @inheritDoc */
    extract( line: string, lineNumber?: number ): T {

        let detection = this.detect( line );
        if ( ! detection ) {
            return null;
        }

        let name = this._lineChecker.textAfterSeparator( Symbols.IMPORT_WRAPPER, line )
            .replace( Symbols.IMPORT_WRAPPER, '' );

        return {
            keyword: this._keyword,
            location: { line: lineNumber || 0, column: detection.position + 1 },

        } as T;
    }

}