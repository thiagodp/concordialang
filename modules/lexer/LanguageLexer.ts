import { Language } from 'concordialang-types';
import { KeywordBasedLexer } from './KeywordBasedLexer';
import { Expressions } from '../req/Expressions';
import { NodeTypes } from '../req/NodeTypes';
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
    public nodeType(): string {
        return NodeTypes.LANGUAGE;
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.IMPORT, NodeTypes.FEATURE, NodeTypes.VARIANT ];
    }

    /** @inheritDoc */
    public affectedKeyword(): string {
        return NodeTypes.LANGUAGE;
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
        let value = this._lineChecker.textAfterSeparator( Symbols.LANGUAGE_SEPARATOR, line ).trim();

        let node = {
            nodeType: NodeTypes.LANGUAGE,
            location: { line: lineNumber || 0, column: pos + 1 },
            value: value
        } as Language;

        return { nodes: [ node ], errors: [] };
    }

}