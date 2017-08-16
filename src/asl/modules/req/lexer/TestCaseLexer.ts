import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { Keywords } from "../Keywords";
import { TestCase } from "../ast/TestCase";
import { Expressions } from '../Expressions';
import { LineChecker } from "../LineChecker";
import { Symbols } from '../Symbols';
import { LexicalException } from "../LexicalException";

const XRegExp = require( 'xregexp' );

/**
 * Detects a TestCase.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestCaseLexer implements NodeLexer< TestCase > {

    private _separator: string = Symbols.TITLE_SEPARATOR;
    private _lineChecker: LineChecker = new LineChecker();
    private _keyword: string = Keywords.TEST_CASE;

    constructor( private _words: Array< string > ) {
    }

    protected makeRegexForTheWords( words: string[] ): string {
        return '^' + Expressions.SPACES_OR_TABS
            + '(' + words.join( '|' ) + ')'
            + Expressions.SPACES_OR_TABS
            + '(?:\\p{L})*' // some optional preposition
            + Expressions.SPACES_OR_TABS
            + '("[^"\r\n]*")?' // some optional name inside quotes
            + Expressions.SPACES_OR_TABS
            + this._separator
            + Expressions.ANYTHING;
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< TestCase > {

        let exp = new XRegExp( this.makeRegexForTheWords( this._words ), "iu" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        let targetScenario = undefined;
        if ( 3 === result.length && result[ 2 ] ) { // keyword is 1 ... "scenario name" is 2 ... : test case name is 3
            targetScenario = result[ 2 ]
                .replace( new RegExp( Symbols.TEST_CASE_WRAPPER , 'g' ), '' ) // replace all '"' with ''
                .trim();            
        }

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );
        let name = this._lineChecker.textAfterSeparator( this._separator, line ).trim();

        let node = {
            keyword: this._keyword,
            location: { line: lineNumber || 0, column: pos + 1 },
            name: name,
            scenarioName: targetScenario
        } as TestCase;

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