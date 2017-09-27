import { KeywordBasedLexer } from './KeywordBasedLexer';
import { Language } from '../ast/Language';
import { Expressions } from '../req/Expressions';
import { TokenTypes } from '../req/TokenTypes';
import { Symbols } from '../req/Symbols';
import { LineChecker } from '../req/LineChecker';
import { LexicalAnalysisResult, NodeLexer } from './NodeLexer';

/**
 * Detects a Language.
 * 
 * @author Thiago Delgado Pinto
 */
export class LanguageLexer implements NodeLexer< Language >, KeywordBasedLexer {

    private _lineChecker: LineChecker = new LineChecker();

    constructor( private _words: string[] ) {
    }

    /** @inheritDoc */
    public keyword(): string {
        return TokenTypes.LANGUAGE;
    }

    /** @inheritDoc */
    public updateWords( words: string[] ) {
        this._words = words;   
    }     

    private makeRegexForTheWords( words: string[] ): string {
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions.escape( Symbols.LANGUAGE_PREFIX )
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(' + words.join( '|' ) + ')'
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions.escape( Symbols.LANGUAGE_SEPARATOR )
            + Expressions.ANYTHING; // the language code
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< Language > {

        let exp = new RegExp( this.makeRegexForTheWords( this._words ), "iu" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );
        let content = this._lineChecker.textAfterSeparator( Symbols.LANGUAGE_SEPARATOR, line ).trim();
        
        let node = {
            keyword: TokenTypes.LANGUAGE,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: content
        } as Language;

        return { nodes: [ node ], errors: [] };
    }

}