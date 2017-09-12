import { NamedNodeLexer } from "./NamedNodeLexer";
import { Node } from '../ast/Node';
import { Symbols } from "../req/Symbols";
import { LineChecker } from "../req/LineChecker";
import { Expressions } from "../req/Expressions";
import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { KeywordBasedLexer } from "./KeywordBasedLexer";
import { LexicalException } from "../req/LexicalException";

/**
 * Keyword block lexer
 * 
 * @author Thiago Delgado Pinto
 */
export class KeywordBlockLexer< T extends Node > implements NodeLexer< T >, KeywordBasedLexer {

    private _separator: string = Symbols.TITLE_SEPARATOR;
    private _lineChecker: LineChecker = new LineChecker();

    constructor( private _words: string[], private _keyword: string ) {
    }

    /** @inheritDoc */
    public keyword(): string {
        return this._keyword;
    }
    
    /** @inheritDoc */
    public updateWords( words: string[] ) {
        this._words = words;   
    }     

    protected makeRegexForTheWords( words: string[] ): string {
        return '^' + Expressions.SPACES_OR_TABS
            + '(' + words.join( '|' ) + ')'
            + Expressions.SPACES_OR_TABS
            + this._separator
            + Expressions.SPACES_OR_TABS;
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< T > {

        let exp = new RegExp( this.makeRegexForTheWords( this._words ), "iu" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );
        let contentAfterSeparator = this._lineChecker.textAfterSeparator( this._separator, line ).trim();

        let node = {
            keyword: this._keyword,
            location: { line: lineNumber || 0, column: pos + 1 }
        } as T;

        let errors = [];
        if ( contentAfterSeparator.length != 0 ) {
            let loc = { line: lineNumber || 0, column: line.indexOf( contentAfterSeparator ) + 1 };
            let msg = 'Invalid content after the ' + this._keyword + ': "' + contentAfterSeparator + '".';
            errors.push( new LexicalException( msg, loc ) );
        }

        return { nodes: [ node ], errors: errors };
    }

}