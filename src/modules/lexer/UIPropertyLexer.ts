import { NodeTypes } from '../req/NodeTypes';
import { ContentNode } from "../ast/Node";
import { NodeLexer, LexicalAnalysisResult } from "./NodeLexer";
import { Expressions } from "../req/Expressions";
import { Symbols } from "../req/Symbols";
import { LineChecker } from "../req/LineChecker";
import { LexicalException } from "../req/LexicalException";
import { UIProperty } from "../ast/UIElement";

/**
 * Detects a node from a UI Element using NLP.
 * 
 * @author Thiago Delgado Pinto
 */
export class UIPropertyLexer implements NodeLexer< UIProperty > {

    private _symbol: string = Symbols.LIST_ITEM_PREFIX;
    private _lineChecker: LineChecker = new LineChecker();
    private _nodeType: string = NodeTypes.UI_PROPERTY;
            
    protected makeRegex(): string {
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + this._symbol
            + Expressions.ANYTHING
            ;
    }

    /** @inheritDoc */
    public keyword(): string {
        return this._nodeType;
    }

    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< UIProperty > {
        
        let exp = new RegExp( this.makeRegex(), "u" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );
        let content = this._lineChecker.textAfterSeparator( this._symbol, line ).trim();

        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            content: line.trim(),
            otherwiseSentences: []
        } as UIProperty;

        let errors = [];
        let warnings = [];

        if ( 0 === content.length ) {
            let msg = 'Empty content in ' + this._nodeType + '.';
            errors.push( new LexicalException( msg, node.location ) );
        }

        return { nodes: [ node ], errors: errors, warnings: warnings };
    }    

}