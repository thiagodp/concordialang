import { Node } from '../ast/Node';
import { Expressions } from '../req/Expressions';
import { LineChecker } from '../req/LineChecker';
import { Symbols } from '../req/Symbols';
import { CommentHandler } from './CommentHandler';
import { KeywordBasedLexer } from './KeywordBasedLexer';
import { LexicalException } from './LexicalException';
import { LexicalAnalysisResult, NodeLexer } from './NodeLexer';

/**
 * Detects a node in the format "keyword:".
 *
 * @author Thiago Delgado Pinto
 */
export class BlockLexer< T extends Node > implements NodeLexer< T >, KeywordBasedLexer {

    private _separator: string = Symbols.TITLE_SEPARATOR;
    private _lineChecker: LineChecker = new LineChecker();

    constructor( private _words: string[], private _nodeType: string ) {
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
            + '(' + words.join( '|' ) + ')'
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + this._separator
            + Expressions.OPTIONAL_SPACES_OR_TABS;
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< T > {

        let exp = new RegExp( this.makeRegexForTheWords( this._words ), "iu" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        let content = ( new CommentHandler() ).removeComment( line );
        let pos = this._lineChecker.countLeftSpacesAndTabs( line );

        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 }
        } as T;

        let errors = [];
        let contentAfterSeparator = this._lineChecker.textAfterSeparator( this._separator, content );
        if ( contentAfterSeparator.length != 0 ) {
            let loc = { line: lineNumber || 0, column: line.indexOf( contentAfterSeparator ) + 1 };
            let msg = 'Invalid content after the ' + this._nodeType + ': "' + contentAfterSeparator + '".';
            errors.push( new LexicalException( msg, loc ) );
        }

        return { nodes: [ node ], errors: errors };
    }

}