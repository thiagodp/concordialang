import { ContentNode } from '../ast/Node';
import { Expressions } from "../req/Expressions";
import { Symbols } from "../req/Symbols";
import { LineChecker } from "../req/LineChecker";
import { LexicalException } from "./LexicalException";
import { NodeLexer, LexicalAnalysisResult } from "./NodeLexer";
import { CommentHandler } from './CommentHandler';

/**
 * Detects a node with the format "- anything".
 *
 * @author Thiago Delgado Pinto
 */
export class ListItemLexer< T extends ContentNode > implements NodeLexer< T > {

    private _symbol: string = Symbols.LIST_ITEM_PREFIX;
    private _lineChecker: LineChecker = new LineChecker();

    constructor( private _nodeType: string ) {
    }

    protected makeRegex(): string {
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + this._symbol
            + Expressions.ANYTHING
            ;
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
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< T > {

        let exp = new RegExp( this.makeRegex(), "u" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        let content = ( new CommentHandler() ).removeComment( line );
        content = this._lineChecker.textAfterSeparator( this._symbol, content ).trim();

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );

        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: content
        } as T;

        let errors = [];
        if ( 0 === content.length ) {
            let msg = 'Empty content in ' + this._nodeType + '.';
            errors.push( new LexicalException( msg, node.location ) );
        }

        return { nodes: [ node ], errors: errors };
    }

}