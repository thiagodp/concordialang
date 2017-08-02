import { Node } from '../ast/Node';
import { DocumentProcessor } from './DocumentProcessor';
import { FeatureParser } from './FeatureParser';
import { ImportParser } from './ImportParser';
import { KeywordDictionary } from '../KeywordDictionary';
import { NodeParser } from './NodeParser';
import { ScenarioParser } from './ScenarioParser';

/**
 * Parser
 */
export class Parser implements DocumentProcessor {

    private _nodes: Array< Node >;
    private _errors: Array< Error >;
    private _parsers: Array< NodeParser< Node > >;

    constructor( private _dictionary: KeywordDictionary ) {
        this._parsers = [
            new ImportParser( _dictionary.import ),
            new FeatureParser( _dictionary.feature ),
            new ScenarioParser( _dictionary.scenario ),
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
            node = parser.parse( line, lineNumber );
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