import { Scenario, Node, Feature } from 'concordialang-types/ast';
import { ScenarioParser } from '../../modules/parser/ScenarioParser';
import { NodeIterator } from '../../modules/parser/NodeIterator';
import { ParsingContext } from '../../modules/parser/ParsingContext';
import { NodeTypes } from '../../modules/req/NodeTypes';


/**
 * @author Thiago Delgado Pinto
 */
describe( 'ScenarioParserTest', () => {

    let parser = new ScenarioParser(); // under test

    let context: ParsingContext = null;
    let nodes: Node[] = [];
    let nodeIt: NodeIterator = null;
    let errors: Error[] = [];

    let featureNode: Feature = {
        nodeType: NodeTypes.FEATURE,
        location: { column: 1, line: 1 },
        name: "My feature"
    };

    let scenarioNode: Scenario = {
        nodeType: NodeTypes.SCENARIO,
        location: { column: 1, line: 2 },
        name: "My scenario",
        sentences: []
    };

    beforeEach( () => {
        nodes = [];
        nodeIt = new NodeIterator( nodes );
        errors = [];
        context = new ParsingContext();
    } );

    it( 'generates an error when a scenario is added without a feature', () => {
        expect( context.doc.feature ).not.toBeDefined();
        parser.analyze( scenarioNode, context, nodeIt, errors );
        expect( errors ).toHaveLength( 1 );
    } );

    it( 'adds an scenario to a feature whether a feature exists', () => {
        context.doc.feature = featureNode;
        parser.analyze( scenarioNode, context, nodeIt, errors );
        expect( errors ).toHaveLength( 0 );
        expect( context.doc.feature.scenarios ).toHaveLength( 1 );
    } );

    it( 'indicates that it is in a scenario when a scenario is detected', () => {
        context.doc.feature = featureNode;
        expect( context.inScenario ).toBeFalsy();
        parser.analyze( scenarioNode, context, nodeIt, errors );
        expect( context.inScenario ).toBeTruthy();
    } );

} );