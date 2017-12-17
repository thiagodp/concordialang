import { KeywordBasedLexer } from './KeywordBasedLexer';
import { Feature } from '../ast/Feature';
import { LocatedException } from '../req/LocatedException';
import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { Expressions } from '../req/Expressions';
import { Symbols } from '../req/Symbols';
import { Node, NamedNode } from '../ast/Node';
import { LineChecker } from "../req/LineChecker";
import { LexicalException } from "../req/LexicalException";

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

        let commentPos = line.indexOf( Symbols.COMMENT_PREFIX );
        let name;
        if ( commentPos >= 0 ) {
            name = this._lineChecker
                .textAfterSeparator( this._separator, line.substring( 0, commentPos ) )
                .trim();
        } else {
            name = this._lineChecker.textAfterSeparator( this._separator, line ).trim();
        }

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