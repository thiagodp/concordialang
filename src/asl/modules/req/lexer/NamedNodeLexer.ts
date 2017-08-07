import { Feature } from '../old_ast/Feature';
import { LocatedException } from '../LocatedException';
import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { Expressions } from '../Expressions';
import { Symbols } from '../Symbols';
import { Keywords } from '../Keywords';
import { Node, NamedNode } from '../old_ast/Node';
import { LineChecker } from "../LineChecker";
import { LexicalException } from "../LexicalException";

const XRegExp = require( 'xregexp' );

/**
 * Detects a node in the format "keyword: name".
 * 
 * @author Thiago Delgado Pinto
 */
export class NamedNodeLexer< T extends NamedNode > implements NodeLexer< T > {

    private _separator: string = Symbols.TITLE_SEPARATOR;
    private _lineChecker: LineChecker = new LineChecker();

    constructor( private _words: Array< string >, private _keyword: string ) {
    }

    private makeRegexForTheWords( words: string[] ): string {
        return '^' + Expressions.SPACES_OR_TABS
            + '(' + words.join( '|' ) + ')'
            + Expressions.SPACES_OR_TABS
            + this._separator
            + Expressions.ANYTHING;
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< T > {

        let exp = new RegExp( this.makeRegexForTheWords( this._words ), "iu" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );
        let name = this._lineChecker.textAfterSeparator( this._separator, line ).trim();

        let node = {
            keyword: this._keyword,
            name: name,
            location: { line: lineNumber || 0, column: pos + 1 }
        } as T;

        let errors = [];
        if ( ! this.isValidName( name ) ) {
            let loc = { line: lineNumber || 0, column: line.indexOf( name ) + 1 };
            let msg = 'Invalid ' + this._keyword + ' name: "' + name + '"';
            errors.push( new LexicalException( msg, loc ) );
        }

        return { node: node, errors: errors };
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