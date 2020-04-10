const XRegExp = require( 'xregexp' );
import { ValuedNode } from '../ast/Node';
import { Expressions } from '../req/Expressions';
import { LineChecker } from '../req/LineChecker';
import { Symbols } from "../req/Symbols";
import { CommentHandler } from './CommentHandler';
import { KeywordBasedLexer } from './KeywordBasedLexer';
import { LexicalException } from "./LexicalException";
import { LexicalAnalysisResult, NodeLexer } from './NodeLexer';

/**
 * Detects a node in the format "keyword "value"".
 *
 * @author Thiago Delgado Pinto
 */
export class QuotedNodeLexer< T extends ValuedNode > implements NodeLexer< T >, KeywordBasedLexer  {

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
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions.SOMETHING_INSIDE_QUOTES
            + Expressions.OPTIONAL_SPACES_OR_TABS;
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< T > {

        let exp = new RegExp( this.makeRegexForTheWords( this._words ), "iu" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        let value = ( new CommentHandler() ).removeComment( line );
        value = this._lineChecker
            .textAfterSeparator( Symbols.VALUE_WRAPPER, value )
            .replace( new RegExp( Symbols.VALUE_WRAPPER , 'g' ), '' ) // replace all '"' with ''
            .trim();

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );

        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            value: value
        } as T;

        let errors = [];
        if ( ! this.isValidName( value ) ) {
            let loc = { line: lineNumber || 0, column: line.indexOf( value ) + 1 };
            let msg = 'Invalid ' + this._nodeType + ': "' + value + '"';
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