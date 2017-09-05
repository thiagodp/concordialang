import { FeatureParser } from './FeatureParser';
import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { Keywords } from '../Keywords';
import { LanguageParser } from './LanguageParser';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from "./ParsingContext";
import { ScenarioParser } from './ScenarioParser';
import { TestCaseParser } from './TestCaseParser';
import { ScenarioSentenceParser } from './ScenarioSentenceParser';

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
        this._parsersMap[ Keywords.FEATURE ] = new FeatureParser();
        this._parsersMap[ Keywords.SCENARIO ] = new ScenarioParser();
        this._parsersMap[ Keywords.TEST_CASE ] = new TestCaseParser();
        this._parsersMap[ Keywords.STEP_GIVEN ] = new ScenarioSentenceParser();
        this._parsersMap[ Keywords.STEP_WHEN ] = new ScenarioSentenceParser();
        this._parsersMap[ Keywords.STEP_THEN ] = new ScenarioSentenceParser();
        this._parsersMap[ Keywords.STEP_AND ] = new ScenarioSentenceParser();
        this._parsersMap[ Keywords.STEP_BUT ] = new ScenarioSentenceParser();

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

        let ignoredKeywords: string[] = [];
        let it = new NodeIterator( nodes );
        let errors = [];
        let node: Node = null;
        let nodeParser: NodeParser< any >;

        let context: ParsingContext = {
            doc: doc,
            inFeature: false,
            inScenario: false,
            inTestCase: false,
            currentScenario: null,
            currentTestCase: null
        };

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
            nodeParser.analyze( node, context, it, errors );

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