import { Regex } from '../ast/Regex';
import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { Keywords } from "../Keywords";
import { Symbols } from "../Symbols";
import { LineChecker } from "../LineChecker";
import { Expressions } from "../Expressions";

/**
 * Detects a Regex.
 * 
 * @author Thiago Delgado Pinto
 */
export class RegexLexer implements NodeLexer< Regex > {

    private _lineChecker: LineChecker = new LineChecker();

    constructor( private _words: string[] ) {
    }    

    private makeRegexForTheWords( words: string[] ): string {
        return '^' + Expressions.SPACES_OR_TABS
            + '(' + words.join( '|' ) + ')'
            + Expressions.SPACES_OR_TABS
            + Expressions.escape( Symbols.REGEX_WRAPPER )
            + '(' + Expressions.ANYTHING + ')'
            + Expressions.escape( Symbols.REGEX_WRAPPER )
            + Expressions.SPACES_OR_TABS
            + Expressions.escape( Symbols.REGEX_SEPARATOR )
            + Expressions.SPACES_OR_TABS
            + '(' + Expressions.ANYTHING + ')'
            ;
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< Regex > {

        let exp = new RegExp( this.makeRegexForTheWords( this._words ), "iu" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );
        let name = result[ 2 ].trim();
        let content = result[ 3 ].trim();

        let node = {
            keyword: Keywords.REGEX,
            location: { line: lineNumber || 0, column: pos + 1 },
            name: name,
            content: content
        } as Regex;

        return { node: node, errors: [] };
    }   

}