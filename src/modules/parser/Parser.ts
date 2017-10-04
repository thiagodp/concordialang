import { BlockItemParser } from './BlockItemParser';
import { ConstantBlockParser } from './ConstantBlockParser';
import { RegexBlockParser } from './RegexBlockParser';
import { FeatureParser } from './FeatureParser';
import { Node } from '../ast/Node';
import { Document } from '../ast/Document';
import { NodeTypes } from '../req/NodeTypes';
import { LanguageParser } from './LanguageParser';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from "./ParsingContext";
import { ScenarioParser } from './ScenarioParser';
import { TestCaseParser } from './TestCaseParser';
import { ImportParser } from "./ImportParser";
import { StateParser } from "./StateParser";
import { StepWhenParser } from './StepWhenParser';
import { StepGivenParser } from './StepGivenParser';
import { StepThenParser } from './StepThenParser';
import { StepAndParser } from './StepAndParser';
import { StepOtherwiseParser } from './StepOtherwiseParser';
import { UIElementParser } from './UIElementParser';
import { UIPropertyParser } from './UIPropertyParser';

/**
 * Builds an AST from the nodes detected by the lexer. It checks syntatic properties
 * of the model (e.g. the order of appearance), but it does not check semantic properties
 * (e.g. check if a import file exists).
 * 
 * @author Thiago Delgado Pinto
 */
export class Parser {

    private _errors: Error[] = [];
    private _parsersMap: {}; // [ "nodeType" ] = NodeParser
    private _context: ParsingContext;

    constructor( private _stopOnFirstError: boolean = false ) {
        this._parsersMap = {};
        this._parsersMap[ NodeTypes.LANGUAGE ] = new LanguageParser();
        this._parsersMap[ NodeTypes.IMPORT ] = new ImportParser();
        this._parsersMap[ NodeTypes.FEATURE ] = new FeatureParser();
        this._parsersMap[ NodeTypes.SCENARIO ] = new ScenarioParser();
        this._parsersMap[ NodeTypes.STEP_GIVEN ] = new StepGivenParser();
        this._parsersMap[ NodeTypes.STEP_WHEN ] = new StepWhenParser();
        this._parsersMap[ NodeTypes.STEP_THEN ] = new StepThenParser();
        this._parsersMap[ NodeTypes.STEP_AND ] = new StepAndParser();
        this._parsersMap[ NodeTypes.STEP_OTHERWISE ] = new StepOtherwiseParser();
        this._parsersMap[ NodeTypes.CONSTANT_BLOCK ] = new ConstantBlockParser();
        this._parsersMap[ NodeTypes.CONSTANT ] = new BlockItemParser();
        this._parsersMap[ NodeTypes.REGEX_BLOCK ] = new RegexBlockParser();
        this._parsersMap[ NodeTypes.REGEX ] = new BlockItemParser();
        this._parsersMap[ NodeTypes.STATE ] = new StateParser();
        this._parsersMap[ NodeTypes.UI_ELEMENT ] = new UIElementParser();
        this._parsersMap[ NodeTypes.UI_PROPERTY ] = new UIPropertyParser();
        this._parsersMap[ NodeTypes.TEST_CASE ] = new TestCaseParser();
    }

    public reset(): void {
        this._errors = [];
    }    

    public stopOnFirstError( stop?: boolean ): boolean {
        if ( stop !== undefined ) {
            this._stopOnFirstError = stop;
        }
        return this._stopOnFirstError;
    }

    public hasErrors(): boolean {
        return this._errors.length > 0;
    }    

    public errors(): Error[] {
        return this._errors;
    }    

    /**
     * Analyze the given nodes and fill the document with the AST. Returns 
     * ignored TokenTypes, that were not parsed because of the lack of parsers.
     * 
     * @param nodes Nodes to be analyzed.
     * @param doc Document where to put the AST.
     */
    public analyze( nodes: Node[], doc: Document ): string[] {

        this.reset();

        let ignoredTokenTypes: string[] = [];
        let it = new NodeIterator( nodes );
        let errors = [];
        let node: Node = null;
        let nodeParser: NodeParser< any > = null;

        let context: ParsingContext = new ParsingContext( doc );

        while ( it.hasNext() ) {
            node = it.next();

            // Retrieves the parser
            nodeParser = this._parsersMap[ node.nodeType ];
            if ( ! nodeParser ) {
                // Remember ignored TokenTypes
                ignoredTokenTypes.push( node.nodeType );
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

        return ignoredTokenTypes;
    }

}