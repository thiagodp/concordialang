import { KeywordBasedLexer } from './KeywordBasedLexer';
import { Node, ContentNode } from '../ast/Node';
import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { Expressions } from '../req/Expressions';
import { LineChecker } from '../req/LineChecker';
import { Symbols } from "../req/Symbols";
import { LexicalException } from "../req/LexicalException";

const XRegExp = require( 'xregexp' );

/**
 * Detects a node in the format "keyword "value"".
 * 
 * @author Thiago Delgado Pinto
 */
export class QuotedNodeLexer< T extends ContentNode > implements NodeLexer< T >, KeywordBasedLexer  {

    private _lineChecker: LineChecker = new LineChecker();

    constructor( private _words: Array< string >, private _nodeType: string ) {
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

        let commentPos = line.indexOf( Symbols.COMMENT_PREFIX );
        let name;
        if ( commentPos >= 0 ) {
            name = this._lineChecker
                .textAfterSeparator( Symbols.VALUE_WRAPPER, line.substring( 0, commentPos ) )
                .replace( new RegExp( Symbols.VALUE_WRAPPER , 'g' ), '' ) // replace all '"' with ''
                .trim();
        } else {
            name = this._lineChecker
                .textAfterSeparator( Symbols.VALUE_WRAPPER, line )
                .replace( new RegExp( Symbols.VALUE_WRAPPER , 'g' ), '' ) // replace all '"' with ''
                .trim();
        }

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );

        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: name
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