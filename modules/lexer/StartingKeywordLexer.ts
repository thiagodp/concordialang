import { ContentNode } from 'concordialang-types/ast';
import { Expressions } from '../req/Expressions';
import { LineChecker } from '../req/LineChecker';
import { Warning } from '../req/Warning';
import { CommentHandler } from './CommentHandler';
import { KeywordBasedLexer } from './KeywordBasedLexer';
import { LexicalAnalysisResult, NodeLexer } from './NodeLexer';

/**
 * Detects a node in the format "keyword anything".
 *
 * @author Thiago Delgado Pinto
 */
export class StartingKeywordLexer< T extends ContentNode > implements NodeLexer< T >, KeywordBasedLexer {

    private _lineChecker: LineChecker = new LineChecker();

    constructor( private _words: Array< string >, private _nodeType: string ) {
    }

    /** @inheritDoc */
    public nodeType(): string {
        return this._nodeType;
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [];
    }

    /** @inheritDoc */
    public affectedKeyword(): string {
        return this._nodeType;
    }

    /** @inheritDoc */
    public updateWords( words: string[] ) {
        this._words = words;
    }

    protected makeRegexForTheWords( words: string[] ): string {
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(?:' + words.join( '|' ) + ')'
            + Expressions.AT_LEAST_ONE_SPACE_OR_TAB_OR_COMMA
            + '(' + Expressions.ANYTHING + ')';
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< T > {

        let exp = new RegExp( this.makeRegexForTheWords( this._words ), "iu" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        const commmentHandler = new CommentHandler();

        let value = commmentHandler.removeComment( result[ 1 ] );
        let content = commmentHandler.removeComment( line );

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );

        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: content
        } as T;

        if ( 'value' in node ) {
            node[ 'value' ] = value;
        }

        let warnings = [];
        if ( value.length < 1 ) {
            let w = new Warning( 'Value is empty', node.location );
            warnings.push( w );
        }

        return { nodes: [ node ], errors: [], warnings: warnings };
    }

}