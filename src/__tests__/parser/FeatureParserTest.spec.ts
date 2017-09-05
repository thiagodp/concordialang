import { Node } from '../../modules/req/ast/Node';
import { NodeIterator } from '../../modules/req/parser/NodeIterator';
import { ParsingContext } from '../../modules/req/parser/ParsingContext';
import { Keywords } from '../../modules/req/Keywords';
import { Feature } from '../../modules/req/ast/Feature';
import { FeatureParser } from '../../modules/req/parser/FeatureParser';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'FeatureParserTest', () => {

    let parser = new FeatureParser(); // under test

    let context: ParsingContext;
    let nodes: Node[] = [];
    let nodeIt: NodeIterator = null;
    let errors: Error[] = [];
    
    let feature: Feature = {
        keyword: Keywords.FEATURE,
        location: { column: 1, line: 1 },
        name: "My feature"
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


    it( 'adds a feature when a feature is not defined', () => {
        expect( context.doc.feature ).not.toBeDefined();

        parser.analyze( feature, context, nodeIt, errors );

        expect( errors ).toHaveLength( 0 );
        expect( context.doc.feature ).toBeDefined();
        expect( context.doc.feature.name ).toBe( "My feature" );        
    } );

    it( 'generates an error when a feature was already defined', () => {        
        parser.analyze( feature, context, nodeIt, errors );
        parser.analyze( feature, context, nodeIt, errors );
        expect( errors ).toHaveLength( 1 );
    } );

    it( 'indicates that it is in a feature when a feature is detected', () => {
        parser.analyze( feature, context, nodeIt, errors );
        expect( context.inFeature ).toBeTruthy();
    } );

} );