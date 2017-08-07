import { Node } from '../ast/Node';
import { DocumentProcessor } from '../DocumentProcessor';
import { FeatureLexer } from './FeatureLexer';
import { ImportLexer } from './ImportLexer';
import { KeywordDictionary } from '../KeywordDictionary';
import { NodeLexer } from './NodeLexer';
import { ScenarioLexer } from './ScenarioLexer';

/**
 * Lexer
 * 
 * @author Thiago Delgado Pinto
 */
export class Lexer implements DocumentProcessor {

    private _nodes: Array< Node >;
    private _errors: Array< Error >;
    private _lexers: Array< NodeLexer< Node > >;

    constructor( private _dictionary: KeywordDictionary ) {
        this._lexers = [
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
        for ( let parser of this._lexers ) {
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