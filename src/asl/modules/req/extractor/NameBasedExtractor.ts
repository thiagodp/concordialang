import { Feature } from '../ast/Feature';
import { LocatedException } from '../parser/LocatedException';
import { ASTNodeExtractor } from './ASTNodeExtractor';
import { Expressions } from './Expressions';
import { Symbols } from './Symbols';
import { Keywords } from './Keywords';
import { ASTNode, NamedASTNode } from '../ast/ASTNode';
import { LineChecker } from "./LineChecker";


export class NameBasedExtractor< T extends NamedASTNode > implements ASTNodeExtractor< T > {

    private _separator: string = Symbols.TITLE_SEPARATOR;
    private _lineChecker: LineChecker = new LineChecker();

    constructor( private _words: Array< string >, private _keyword: string ) {
    }

    private makeRegexForTheWord( word: string ): string {
        return '^' + Expressions.SPACES_OR_TABS
            + '(' + word + ')'
            + Expressions.SPACES_OR_TABS
            + this._separator
            + Expressions.ANYTHING;
    }

    /** @inheritDoc */
    public extract( line: string, lineNumber?: number ): T {

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

        let name = this._lineChecker.textAfterSeparator( this._separator, line ).trim();
        return {
            keyword: this._keyword,
            name: name,
            location: { line: lineNumber || 0, column: pos + 1 }
        } as T;
    }

}