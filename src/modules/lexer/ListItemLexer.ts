import { ContentNode } from "../ast/Node";
import { NodeLexer, LexicalAnalysisResult } from "./NodeLexer";
import { Expressions } from "../req/Expressions";
import { Symbols } from "../req/Symbols";
import { LineChecker } from "../req/LineChecker";
import { LexicalException } from "../req/LexicalException";

/**
 * Detects a node with the format "- anything".
 * 
 * @author Thiago Delgado Pinto
 */
export class ListItemLexer< T extends ContentNode > implements NodeLexer< T > {

    private _symbol: string = Symbols.LIST_ITEM_PREFIX;
    private _lineChecker: LineChecker = new LineChecker();
    
    constructor( private _keyword: string ) {
    }
        
    protected makeRegex(): string {
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + this._symbol
            + Expressions.ANYTHING
            ;
    }

    /** @inheritDoc */
    public keyword(): string {
        return this._keyword;
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< T > {
        
        let exp = new RegExp( this.makeRegex(), "u" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );
        let content = this._lineChecker.textAfterSeparator( this._symbol, line ).trim();

        let node = {
            keyword: this._keyword,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: content
        } as T;

        let errors = [];
        if ( 0 === content.length ) {
            let msg = 'Empty content in ' + this._keyword + '.';
            errors.push( new LexicalException( msg, node.location ) );
        }

        return { nodes: [ node ], errors: errors };
    }    

}