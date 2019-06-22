import { Regex } from '../ast/Regex';
import { NodeTypes } from "../req/NodeTypes";
import { LineChecker } from '../req/LineChecker';
import { Expressions } from '../req/Expressions';
import { Symbols } from '../req/Symbols';
import { LexicalException } from '../req/LexicalException';
import { NodeLexer, LexicalAnalysisResult } from './NodeLexer';
import { KeywordBasedLexer } from './KeywordBasedLexer';
import { CommentHandler } from './CommentHandler';

/**
 * Detects a Regex.
 *
 * @author Thiago Delgado Pinto
 */
export class RegexLexer implements NodeLexer< Regex >, KeywordBasedLexer {

    private _lineChecker: LineChecker = new LineChecker();
    private _nodeType: string = NodeTypes.REGEX;

    constructor( private _words: string[]  ) {
    }

    /** @inheritDoc */
    public nodeType(): string {
        return this._nodeType;
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.REGEX ];
    }

    /** @inheritDoc */
    public affectedKeyword(): string {
        return NodeTypes.IS;
    }

    /** @inheritDoc */
    public updateWords( words: string[] ) {
        this._words = words;
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< Regex > {

        // - "foo" is "bar"
        let result = new RegExp(
            this.makeRegexForTheWords( this._words )
            , 'ui'
        ).exec( line );
        if ( ! result ) {
            return null;
        }

        // Not let's get the values inside quotes
        const regex = /(["'])(?:(?=(\\?))\2.)*?\1/g;
        let m;
        let values = [];
        while ( ( m = regex.exec( line ) ) !== null ) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            // Add the value
            m.forEach( ( match, groupIndex ) => {
                if ( match && match.trim().length > 1 ) {
                  values.push( match );
                }
            } );
        }
        if ( values.length < 1 ) {
            return null;
        }

        // Let's extract the interesting parts

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );

        let name = values[ 0 ]
            .replace( new RegExp( Symbols.VALUE_WRAPPER , 'g' ), '' ) // replace all '"' with ''
            .trim();

        let value = values[ 1 ];

        // Removes the wrapper of the content, if the wrapper exists
        let firstWrapperIndex = value.indexOf( Symbols.VALUE_WRAPPER );
        if ( firstWrapperIndex >= 0 ) {
            let lastWrapperIndex = value.lastIndexOf( Symbols.VALUE_WRAPPER );
            if ( firstWrapperIndex != lastWrapperIndex ) {
                value = value.substring( firstWrapperIndex + 1, lastWrapperIndex );
            }
        }


        let content = ( new CommentHandler() ).removeComment( line );
        content = this._lineChecker.textAfterSeparator( Symbols.LIST_ITEM_PREFIX, content ).trim();

        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: content,
            name: name,
            value: value
        } as Regex;

        let errors = [];
        if ( 0 == name.length ) {
            let msg = this._nodeType + ' cannot have an empty name.';
            errors.push( new LexicalException( msg, node.location ) );
        }

        return { nodes: [ node ], errors: errors };
    }


    protected makeRegexForTheWords( words: string[] ): string {
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + Symbols.LIST_ITEM_PREFIX // -
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions.SOMETHING_INSIDE_QUOTES
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(?:' + words.join( '|' ) + ')' // is
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(' + Expressions.SOMETHING_INSIDE_QUOTES + ')'
            + Expressions.OPTIONAL_SPACES_OR_TABS
            ;
    }

}