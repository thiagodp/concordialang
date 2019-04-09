import { NamedNode } from 'concordialang-types/ast';
import { Expressions } from '../req/Expressions';
import { LexicalException } from '../req/LexicalException';
import { LineChecker } from '../req/LineChecker';
import { Symbols } from '../req/Symbols';
import { CommentHandler } from './CommentHandler';
import { KeywordBasedLexer } from './KeywordBasedLexer';
import { LexicalAnalysisResult, NodeLexer } from './NodeLexer';

const XRegExp = require( 'xregexp' );

/**
 * Detects a node in the format "keyword: name".
 *
 * @author Thiago Delgado Pinto
 */
export class NamedNodeLexer< T extends NamedNode > implements NodeLexer< T >, KeywordBasedLexer {

    private _separator: string = Symbols.TITLE_SEPARATOR;
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

    protected separator(): string {
        return this._separator;
    }

    protected makeRegexForTheWords( words: string[] ): string {
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(' + words.join( '|' ) + ')'
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + this._separator
            + Expressions.ANYTHING; // the name
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< T > {

        let exp = new RegExp( this.makeRegexForTheWords( this._words ), "iu" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );

        let name = ( new CommentHandler() ).removeComment( line );
        name = this._lineChecker.textAfterSeparator( this._separator, name ).trim();

        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            name: name
        } as T;

        let errors = [];
        if ( ! this.isValidName( name ) ) {
            let loc = { line: lineNumber || 0, column: line.indexOf( name ) + 1 };
            let msg = 'Invalid ' + this._nodeType + ' name: "' + name + '"';
            errors.push( new LexicalException( msg, loc ) );
        }

        return { nodes: [ node ], errors: errors };
    }

    /**
     * Returns true if the given name is a valid one.
     *
     * @param name Name
     */
    public isValidName( name: string ): boolean {
        return XRegExp( '^[\\p{L}][\\p{L}0-9 ._-]*$', 'ui' ).test( name ); // TO-DO: improve the regex
    }

}