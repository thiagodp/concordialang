import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { Keywords } from '../Keywords';
import { LanguageParser } from './LanguageParser';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from "./ParsingContext";

/**
 * Builds an AST from the nodes detected by the lexer. It checks syntatic properties
 * of the model (e.g. the order of appearance), but it does not check semantic properties
 * (e.g. check if a import file exists).
 * 
 * @author Thiago Delgado Pinto
 */
export class Parser {

    private _errors: Array< Error > = [];
    private _parsersMap: {}; // [ "keyword" ] = NodeParser
    private _context: ParsingContext;

    constructor( private _stopOnFirstError: boolean = false ) {
        this._parsersMap = {};
        this._parsersMap[ Keywords.LANGUAGE ] = new LanguageParser();
    }

    /**
     * Analyze the given nodes and returns a Document containing the AST.
     * 
     * @param nodes Nodes to be analyzed.
     */
    public analyze( nodes: Node[] ): Document {
        this.reset();

        let doc: Document = {};

        this.parseIndividualNodes( nodes, doc );

        this.performAnalysisBetweenNodes( nodes, doc );

        return doc;
    }

    public stopOnFirstError( stop?: boolean ): boolean {
        if ( stop !== undefined ) {
            this._stopOnFirstError = stop;
        }
        return this._stopOnFirstError;
    }    

    public reset(): void {
        this._errors = [];
    }

    public errors(): Array< Error > {
        return this._errors;
    }    

    /**
     * Parses the given nodes. Returns the ignored keywords, that were not parsed
     * because of the lack of parsers.
     * 
     * @param nodes Nodes to be parsed.
     * @param doc 
     */
    public parseIndividualNodes( nodes: Node[], doc: Document ): string[] {

        let ignoredKeywords: string[];
        let it = new NodeIterator( nodes );
        let errors = [];
        let node: Node = null;
        let nodeParser: NodeParser< any >;

        while ( it.hasNext() ) {
            node = it.next();

            // Retrieves the parser
            nodeParser = this._parsersMap[ node.keyword ];
            if ( ! nodeParser ) {
                // Remember ignored keywords
                ignoredKeywords.push( node.keyword );
                continue;
            }
            // Parses the current node            
            nodeParser.analyze( node, doc, it, errors );

            // Stop if needed
            if ( this._stopOnFirstError && errors.length > 0 ) {
                break;
            }            
        }

        // Add the "errors" array to "_errors"
        this._errors.push.apply( this._errors, errors );

        return ignoredKeywords;
    }

    protected performAnalysisBetweenNodes( nodes: Node[], doc: Document ): void {
    }

}