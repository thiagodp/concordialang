import { NodeWithNameAndContent } from "../ast/Node";
import { NodeLexer, LexicalAnalysisResult } from "./NodeLexer";
import { KeywordBasedLexer } from "./KeywordBasedLexer";
import { Expressions } from "../req/Expressions";
import { Symbols } from "../req/Symbols";
import { LineChecker } from "../req/LineChecker";
import { LexicalException } from "../req/LexicalException";

/**
 * Detects a node with the format "- "foo" is "bar"".
 * 
 * @author Thiago Delgado Pinto
 */
export class NameIsContentLexer< T extends NodeWithNameAndContent > implements NodeLexer< T >, KeywordBasedLexer {

    private _lineChecker: LineChecker = new LineChecker();
    
    constructor( private _words: string[], private _nodeType: string ) {
    }
        
    protected makeRegexForTheWords( words: string[] ): string {
        return '^' + Expressions.OPTIONAL_SPACES_OR_TABS
            + Symbols.LIST_ITEM_PREFIX // -
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions.SOMETHING_INSIDE_QUOTES
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + '(?:' + words.join( '|' ) + ')' // is
            + Expressions.OPTIONAL_SPACES_OR_TABS
            + Expressions.SOMETHING_INSIDE_QUOTES
            + Expressions.OPTIONAL_SPACES_OR_TABS
            ;
    }

    /** @inheritDoc */
    public nodeType(): string {
        return this._nodeType;
    }

    /** @inheritDoc */
    public updateWords( words: string[] ) {
        this._words = words;   
    }
        
    /** @inheritDoc */
    public analyze( line: string, lineNumber?: number ): LexicalAnalysisResult< T > {

        let exp = new RegExp( this.makeRegexForTheWords( this._words ), "iu" );
        let result = exp.exec( line );
        if ( ! result ) {
            return null;
        }

        let pos = this._lineChecker.countLeftSpacesAndTabs( line );
        
        let name = result[ 1 ]
            .replace( new RegExp( Symbols.VALUE_WRAPPER , 'g' ), '' ) // replace all '"' with ''
            .trim();

        let content = result[ 2 ]; 
        // Removes the wrapper of the content, if the wrapper exists
        let firstWrapperIndex = content.indexOf( Symbols.VALUE_WRAPPER );
        if ( firstWrapperIndex >= 0 ) {
            let lastWrapperIndex = content.lastIndexOf( Symbols.VALUE_WRAPPER );
            if ( firstWrapperIndex != lastWrapperIndex ) {
                content = content.substring( firstWrapperIndex + 1, lastWrapperIndex );
            }
        }

        let node = {
            nodeType: this._nodeType,
            location: { line: lineNumber || 0, column: pos + 1 },
            name: name,
            content: content
        } as T;

        let errors = [];
        if ( 0 == name.length ) {
            let msg = this._nodeType + ' cannot have an empty name.';
            errors.push( new LexicalException( msg, node.location ) );
        }

        return { nodes: [ node ], errors: errors };
    }

}