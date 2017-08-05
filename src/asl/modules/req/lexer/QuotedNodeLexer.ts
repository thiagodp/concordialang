import { Node, ContentNode } from '../old_ast/Node';
import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { Expressions } from '../Expressions';
import { LineChecker } from '../LineChecker';
import { Symbols } from "../Symbols";

/**
 * Detects a node in the format "keyword "value"".
 * 
 * @author Thiago Delgado Pinto
 */
export class QuotedNodeLexer< T extends ContentNode > implements NodeLexer< T >  {

    private _lineChecker: LineChecker = new LineChecker();

    constructor( private _words: Array< string >, private _keyword: string ) {
    }

    private makeRegexForTheWords( words: string[] ): string {
        return '^' + Expressions.SPACES_OR_TABS
            + '(?:' + words.join( '|' ) + ')'
            + Expressions.SPACES_OR_TABS
            + '("[^"\r\n]*")';
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< T > {

        let exp = new RegExp( this.makeRegexForTheWords( this._words ), "iu" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );
        let name = this._lineChecker.textAfterSeparator( Symbols.IMPORT_WRAPPER, line )
            .replace( Symbols.IMPORT_WRAPPER, '' );

        let node = {
            keyword: this._keyword,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: name
        } as T;

        return { node: node, errors: [] };
    }

}