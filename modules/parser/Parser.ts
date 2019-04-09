import { Document, Node } from 'concordialang-types/ast';
import { NodeTypes } from '../req/NodeTypes';
import { AfterAllParser } from './AfterAllParser';
import { AfterEachScenarioParser } from './AfterEachScenarioParser';
import { AfterFeatureParser } from './AfterFeatureParser';
import { BackgroundParser } from './BackgroundParser';
import { BeforeAllParser } from './BeforeAllParser';
import { BeforeEachScenarioParser } from './BeforeEachScenarioParser';
import { BeforeFeatureParser } from './BeforeFeatureParser';
import { ConstantBlockParser } from './ConstantBlockParser';
import { DatabaseParser } from './DatabaseParser';
import { FeatureParser } from './FeatureParser';
import { ImportParser } from './ImportParser';
import { LanguageParser } from './LanguageParser';
import { ListItemParser } from './ListItemParser';
import { NodeIterator } from './NodeIterator';
import { NodeParser } from './NodeParser';
import { ParsingContext } from './ParsingContext';
import { RegexBlockParser } from './RegexBlockParser';
import { ScenarioParser } from './ScenarioParser';
import { StepAndParser } from './StepAndParser';
import { StepGivenParser } from './StepGivenParser';
import { StepOtherwiseParser } from './StepOtherwiseParser';
import { StepThenParser } from './StepThenParser';
import { StepWhenParser } from './StepWhenParser';
import { TableParser } from './TableParser';
import { TableRowParser } from './TableRowParser';
import { TestCaseParser } from './TestCaseParser';
import { UIElementParser } from './UIElementParser';
import { VariantBackgroundParser } from './VariantBackgroundParser';
import { VariantParser } from './VariantParser';

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

    constructor( private _stopOnFirstError: boolean = false ) {
        this._parsersMap = {};
        this._parsersMap[ NodeTypes.LANGUAGE ] = new LanguageParser();
        this._parsersMap[ NodeTypes.IMPORT ] = new ImportParser();
        this._parsersMap[ NodeTypes.FEATURE ] = new FeatureParser();
        this._parsersMap[ NodeTypes.BACKGROUND ] = new BackgroundParser();
        this._parsersMap[ NodeTypes.VARIANT_BACKGROUND ] = new VariantBackgroundParser();
        this._parsersMap[ NodeTypes.SCENARIO ] = new ScenarioParser();
        this._parsersMap[ NodeTypes.STEP_GIVEN ] = new StepGivenParser();
        this._parsersMap[ NodeTypes.STEP_WHEN ] = new StepWhenParser();
        this._parsersMap[ NodeTypes.STEP_THEN ] = new StepThenParser();
        this._parsersMap[ NodeTypes.STEP_AND ] = new StepAndParser();
        this._parsersMap[ NodeTypes.STEP_OTHERWISE ] = new StepOtherwiseParser();
        this._parsersMap[ NodeTypes.CONSTANT_BLOCK ] = new ConstantBlockParser();
        this._parsersMap[ NodeTypes.CONSTANT ] = new ListItemParser();
        this._parsersMap[ NodeTypes.REGEX_BLOCK ] = new RegexBlockParser();
        this._parsersMap[ NodeTypes.REGEX ] = new ListItemParser();
        this._parsersMap[ NodeTypes.TABLE ] = new TableParser();
        this._parsersMap[ NodeTypes.TABLE_ROW ] = new TableRowParser();
        this._parsersMap[ NodeTypes.UI_ELEMENT ] = new UIElementParser();
        this._parsersMap[ NodeTypes.UI_PROPERTY ] = new ListItemParser();
        this._parsersMap[ NodeTypes.DATABASE ] = new DatabaseParser();
        this._parsersMap[ NodeTypes.DATABASE_PROPERTY ] = new ListItemParser();
        this._parsersMap[ NodeTypes.VARIANT ] = new VariantParser();
        this._parsersMap[ NodeTypes.TEST_CASE ] = new TestCaseParser();
        this._parsersMap[ NodeTypes.BEFORE_ALL ] = new BeforeAllParser();
        this._parsersMap[ NodeTypes.AFTER_ALL ] = new AfterAllParser();
        this._parsersMap[ NodeTypes.BEFORE_FEATURE ] = new BeforeFeatureParser();
        this._parsersMap[ NodeTypes.AFTER_FEATURE ] = new AfterFeatureParser();
        this._parsersMap[ NodeTypes.BEFORE_EACH_SCENARIO ] = new BeforeEachScenarioParser();
        this._parsersMap[ NodeTypes.AFTER_EACH_SCENARIO ] = new AfterEachScenarioParser();
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