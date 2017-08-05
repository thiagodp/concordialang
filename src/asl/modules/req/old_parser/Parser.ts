import { Node } from '../old_ast/Node';
import { DocumentProcessor } from './DocumentProcessor';
import { FeatureLexer } from '../lexer/FeatureLexer';
import { ImportLexer } from '../lexer/ImportLexer';
import { KeywordDictionary } from '../KeywordDictionary';
import { NodeLexer } from '../lexer/NodeLexer';
import { ScenarioLexer } from '../lexer/ScenarioLexer';

/**
 * Parser
 * 
 * @author Thiago Delgado Pinto
 */
export class Parser implements DocumentProcessor {

    private _nodes: Array< Node >;
    private _errors: Array< Error >;
    private _parsers: Array< NodeLexer< Node > >;

    constructor( private _dictionary: KeywordDictionary ) {
        this._parsers = [
            new ImportLexer( _dictionary.import ),
            new FeatureLexer( _dictionary.feature ),
            new ScenarioLexer( _dictionary.scenario ),
        ];
        this.reset();
    }

    public reset() {
        this._nodes = [];
        this._errors = [];
    }

    public errors(): Array< Error > {
        return this._errors;
    }

    public nodes(): Array< Node > {
        return this._nodes;
    }

    /** @inheritDoc */
    public onStart( name?: string ): void {
        this.reset();
    }

    /** @inheritDoc */
    public onError( message: string ): void {
        this._errors.push( new Error( message ) );
    }

    /** @inheritDoc */
    public onLineRead( line: string, lineNumber: number ): void {
        if ( 0 === line.trim().length ) { // Ignore empty lines
            return;
        }
        let node: Node;
        for ( let parser of this._parsers ) {
            node = parser.analyze( line, lineNumber );
            if ( node ) {
                this._nodes.push( node );
                break; // finish parsing the line
            }
        }
    }

    /** @inheritDoc */
    public onFinish(): void {
        // ?
    }    
}