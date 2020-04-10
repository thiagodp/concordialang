import { Constant } from '../ast/Constant';
import { Expressions } from '../req/Expressions';
import { LineChecker } from '../req/LineChecker';
import { NodeTypes } from '../req/NodeTypes';
import { Symbols } from '../req/Symbols';
import { CommentHandler } from './CommentHandler';
import { KeywordBasedLexer } from './KeywordBasedLexer';
import { LexicalException } from './LexicalException';
import { LexicalAnalysisResult, NodeLexer } from './NodeLexer';

/**
 * Detects a Contant.
 *
 * @author Thiago Delgado Pinto
 */
export class ConstantLexer implements NodeLexer< Constant >, KeywordBasedLexer {

    private _lineChecker: LineChecker = new LineChecker();
    private _nodeType: string = NodeTypes.CONSTANT;

    constructor( private _words: string[] ) {
    }

    /** @inheritDoc */
    public nodeType(): string {
        return this._nodeType;
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.CONSTANT ];
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
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< Constant > {

        let exp = new RegExp( this.makeRegexForTheWords( this._words ), "iu" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );

        let name = result[ 1 ]
            .replace( new RegExp( Symbols.VALUE_WRAPPER , 'g' ), '' ) // replace all '"' with ''
            .trim();

        let value = result[ 2 ];
        // Removes the wrapper of the content, if the wrapper exists
        let firstWrapperIndex = value.indexOf( Symbols.VALUE_WRAPPER );
        if ( firstWrapperIndex >= 0 ) {
            let lastWrapperIndex = value.lastIndexOf( Symbols.VALUE_WRAPPER );
            if ( firstWrapperIndex != lastWrapperIndex ) {
                value = value.substring( firstWrapperIndex + 1, lastWrapperIndex );
            }
        }

        // Ignores comment
        let content = ( new CommentHandler() ).removeComment( line );
        content = this._lineChecker.textAfterSeparator( Symbols.LIST_ITEM_PREFIX, content ).trim();

        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            name: name,
            value: value,
            content: content
        } as Constant;

        let errors = [];
        if ( 0 == name.length ) {
            let msg = this._nodeType + ' cannot have an empty name.';
            errors.push( new LexicalException( msg, node.location ) );
        }

        return { nodes: [ node ], errors: errors };
    }


    protected makeRegexForTheWords( words: string[] ): string {

        const regexStr =
            '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + Symbols.LIST_ITEM_PREFIX // -
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions.SOMETHING_INSIDE_QUOTES
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(?:' + words.join( '|' ) + ')' // is
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(' + Expressions.SOMETHING_INSIDE_QUOTES + '|' + Expressions.A_NUMBER + ')'
            + Expressions.OPTIONAL_SPACES_OR_TABS
            ;

        return regexStr;
    }

}
