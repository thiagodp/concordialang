import { Node, ContentNode } from '../ast/Node';
import { NodeLexer, LexicalAnalysisResult } from "./NodeLexer";
import { LineChecker } from "../req/LineChecker";
import { Expressions } from "../req/Expressions";
import { KeywordBasedLexer } from "./KeywordBasedLexer";

/**
 * Detects a node in the format "keyword anything".
 * 
 * @author Thiago Delgado Pinto
 */
export class StartingKeywordLexer< T extends ContentNode > implements NodeLexer< T >, KeywordBasedLexer {

    private _lineChecker: LineChecker = new LineChecker();

    constructor( private _words: Array< string >, private _keyword: string ) {
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
            + '(?:' + words.join( '|' ) + ')'
            + Expressions.AT_LEAST_ONE_SPACE_OR_TAB
            + '(' + Expressions.ANYTHING + ')';
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< T > {

        let exp = new RegExp( this.makeRegexForTheWords( this._words ), "iu" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );
        let content = result[ 1 ].trim();

        let node = {
            keyword: this._keyword,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: content
        } as T;

        return { nodes: [ node ], errors: [] };
    }

}