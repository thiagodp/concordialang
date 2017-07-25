import { ASTNode, ContentASTNode } from '../ast/ASTNode';
import { ASTNodeExtractor } from './ASTNodeExtractor';
import { Expressions } from './Expressions';
import { LineChecker } from './LineChecker';
import { Symbols } from "./Symbols";


export class QuoteBasedExtractor< T extends ContentASTNode > implements ASTNodeExtractor< T >  {

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
    extract( line: string, lineNumber?: number ): T {

        let word: string;
        let keyword: string;
        let pos: number = -1;

        for ( let i in this._words ) {
            word = this._words[ i ];
            let exp = new RegExp( this.makeRegexForTheWord( word ), "iu" );
            let result = exp.exec( line );
            if ( result ) {
                keyword = word;
                pos = this._lineChecker.caseInsensitivePositionOf( word, line );
                break;
            }
        }

        if ( pos < 0 ) {
            return null;
        }

        let name = this._lineChecker.textAfterSeparator( Symbols.IMPORT_WRAPPER, line )
            .replace( Symbols.IMPORT_WRAPPER, '' );

        return {
            keyword: this._keyword,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: name
        } as T;
    }

}