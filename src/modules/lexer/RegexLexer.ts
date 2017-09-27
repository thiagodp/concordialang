import { KeywordBlockLexer } from './KeywordBlockLexer';
import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { TokenTypes } from "../req/TokenTypes";
import { Symbols } from "../req/Symbols";
import { LineChecker } from "../req/LineChecker";
import { Expressions } from "../req/Expressions";
import { RegexesBlock } from '../ast/RegexBlock';

/**
 * Detects a Regex.
 * 
 * @author Thiago Delgado Pinto
 */
export class RegexLexer extends KeywordBlockLexer< RegexesBlock > {

    constructor( words: string[] ) {
        super( words, TokenTypes.REGEX );
    }
}


// export class RegexLexer implements NodeLexer< Regex >, KeywordBasedLexer {

//     private _lineChecker: LineChecker = new LineChecker();

//     constructor( private _words: string[] ) {
//     }

//     /** @inheritDoc */
//     public keyword(): string {
//         return TokenTypes.REGEX;
//     }

//     /** @inheritDoc */
//     public updateWords( words: string[] ) {
//         this._words = words;   
//     }     

//     private makeRegexForTheWords( words: string[] ): string {
//         return '^' + Expressions.SPACES_OR_TABS
//             + '(' + words.join( '|' ) + ')'
//             + Expressions.SPACES_OR_TABS
//             + Expressions.escape( Symbols.REGEX_WRAPPER )
//             + '(' + Expressions.ANYTHING + ')'
//             + Expressions.escape( Symbols.REGEX_WRAPPER )
//             + Expressions.SPACES_OR_TABS
//             + Expressions.escape( Symbols.REGEX_SEPARATOR )
//             + Expressions.SPACES_OR_TABS
//             + '(' + Expressions.ANYTHING + ')'
//             ;
//     }

//     /** @inheritDoc */
//     public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< Regex > {

//         let exp = new RegExp( this.makeRegexForTheWords( this._words ), "iu" );
//         let result = exp.exec( line );
//         if ( ! result ) {
//             return null;
//         }

//         let pos = this._lineChecker.countLeftSpacesAndTabs( line );
//         let name = result[ 2 ].trim();
//         let content = result[ 3 ].trim();

//         let node = {
//             keyword: TokenTypes.REGEX,
//             location: { line: lineNumber || 0, column: pos + 1 },
//             name: name,
//             content: content
//         } as Regex;

//         return { nodes: [ node ], errors: [] };
//     }   

// }