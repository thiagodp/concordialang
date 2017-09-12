import { Node } from '../../modules/ast/Node';
import { NodeIterator } from '../../modules/parser/NodeIterator';
import { ParsingContext } from '../../modules/parser/ParsingContext';
import { Keywords } from '../../modules/req/Keywords';
import { Feature } from '../../modules/ast/Feature';
import { TestCaseParser } from "../../modules/parser/TestCaseParser";
import { TestCase } from "../../modules/ast/TestCase";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'TestCaseParserTest', () => {

    let parser = new TestCaseParser(); // under test

    let context: ParsingContext = null;
    let nodes: Node[] = [];
    let nodeIt: NodeIterator = null;
    let errors: Error[] = [];

    let featureNode: Feature = {
        keyword: Keywords.FEATURE,
        location: { column: 1, line: 1 },
        name: "My feature"
    };

    let testCaseNode: TestCase = {
        keyword: Keywords.TEST_CASE,
        location: { column: 1, line: 2 },
        name: "My test case",
        sentences: []
    };

    beforeEach( () => {
        nodes = [];
        nodeIt = new NodeIterator( nodes );
        errors = [];
        context = new ParsingContext();
    } );

    it( 'generates an error when a test case is added without a feature', () => {
        expect( context.doc.feature ).not.toBeDefined();
        parser.analyze( testCaseNode, context, nodeIt, errors );
        expect( errors ).toHaveLength( 1 );     
    } );

    it( 'adds a test case to a feature whether a feature exists', () => {
        context.doc.feature = featureNode;
        parser.analyze( testCaseNode, context, nodeIt, errors );
        expect( errors ).toHaveLength( 0 );
        expect( context.doc.feature.testcases ).toHaveLength( 1 );
    } );    

    it( 'indicates that it is in a test case when a test case is detected', () => {
        context.doc.feature = featureNode;
        expect( context.inTestCase ).toBeFalsy();
        parser.analyze( testCaseNode, context, nodeIt, errors );
        expect( context.inTestCase ).toBeTruthy();
    } );

} );