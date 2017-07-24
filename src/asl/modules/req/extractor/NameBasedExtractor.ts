import { Feature } from '../ast/Feature';
import { LocatedException } from '../parser/LocatedException';
import { ASTNodeExtractor, TokenDetection } from './ASTNodeExtractor';
import { DictionaryBasedNodeExtractor, DictionaryBasedOptions } from './DictionaryBasedNodeExtractor';
import { Expressions } from './Expressions';
import { Symbols } from './Symbols';
import { TokenTypes } from './TokenTypes';
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
    public detect( line: string ): TokenDetection | null {
        let word;
        for ( let i in this._words ) {
            word = this._words[ i ];
            let exp = new RegExp( this.makeRegexForTheWord( word ), "iu" );
            let result = exp.exec( line );
            if ( result ) {
                //return { keyword: word, position: result.index };
                return {
                    keyword: word,
                    position: this._lineChecker.caseInsensitivePositionOf( word, line )
                };
            }
        }
        return null;
    }


    /** @inheritDoc */
    public extract( line: string, lineNumber: number ): T {

        let detection = this.detect( line );
        if ( ! detection ) {
            return null;
        }

        let name = this._lineChecker.textAfterSeparator( this._separator, line ).trim();
        return {
            keyword: this._keyword,
            name: name,
            location: { line: lineNumber, column: detection.position + 1 }
        } as T;
    }

}