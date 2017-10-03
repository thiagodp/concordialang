import { NodeTypes } from '../req/NodeTypes';
import { ContentNode } from "../ast/Node";
import { NodeLexer, LexicalAnalysisResult } from "./NodeLexer";
import { Expressions } from "../req/Expressions";
import { Symbols } from "../req/Symbols";
import { LineChecker } from "../req/LineChecker";
import { LexicalException } from "../req/LexicalException";
import { UIElementItem } from "../ast/UIElement";
import { SentenceProcessor } from '../nlp/SentenceProcessor';

/**
 * Detects a node from a UI Element using NLP.
 * 
 * @author Thiago Delgado Pinto
 */
export class UIElementItemLexer implements NodeLexer< UIElementItem > {

    private _symbol: string = Symbols.LIST_ITEM_PREFIX;
    private _lineChecker: LineChecker = new LineChecker();
    private _nodeType: string = NodeTypes.UI_ELEMENT_ITEM;
    
    constructor( private _sentenceProcessor: SentenceProcessor ) {
    }
        
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
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< UIElementItem > {
        
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
        } as UIElementItem;

        let errors = [];
        if ( 0 === content.length ) {
            let msg = 'Empty content in ' + this._nodeType + '.';
            errors.push( new LexicalException( msg, node.location ) );
        }

        return { nodes: [ node ], errors: errors };
    }    

}