import { Scenario } from '../../modules/req/ast/Scenario';
import { ScenarioParser } from '../../modules/req/parser/ScenarioParser';
import { Node } from '../../modules/req/ast/Node';
import { NodeIterator } from '../../modules/req/parser/NodeIterator';
import { ParsingContext } from '../../modules/req/parser/ParsingContext';
import { Keywords } from '../../modules/req/Keywords';
import { Feature } from '../../modules/req/ast/Feature';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'ScenarioParserTest', () => {

    let parser = new ScenarioParser(); // under test

    let context: ParsingContext;
    let nodes: Node[] = [];
    let nodeIt: NodeIterator = null;
    let errors: Error[] = [];

    let feature: Feature = {
        keyword: Keywords.FEATURE,
        location: { column: 1, line: 1 },
        name: "My feature"
    };

    let scenario: Scenario = {
        keyword: Keywords.SCENARIO,
        location: { column: 1, line: 2 },
        name: "My scenario",
        sentences: []
    };

    beforeEach( () => {

        nodes = [];
        nodeIt = new NodeIterator( nodes );
        errors = [];

        context = {
            doc: {},
            currentScenario: null,
            currentTestCase: null,
            inFeature: false,
            inScenario: false,
            inTestCase: false
        };

    } );

    it( 'generates an error when a scenario is added without a feature', () => {
        expect( context.doc.feature ).not.toBeDefined();
        parser.analyze( scenario, context, nodeIt, errors );
        expect( errors ).toHaveLength( 1 );     
    } );

    it( 'adds an scenario to a feature whether a feature exists', () => {
        context.doc.feature = feature;
        parser.analyze( scenario, context, nodeIt, errors );
        expect( errors ).toHaveLength( 0 );
        expect( context.doc.feature.scenarios ).toHaveLength( 1 );
    } );    

    it( 'indicates that it is in a scenario when a scenario is detected', () => {
        context.doc.feature = feature;
        expect( context.inScenario ).toBeFalsy();
        parser.analyze( scenario, context, nodeIt, errors );
        expect( context.inScenario ).toBeTruthy();
    } );

} );