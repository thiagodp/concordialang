import { Node, Feature, TestCase } from '../../modules/ast';
import { NodeIterator } from '../../modules/parser/NodeIterator';
import { ParsingContext } from '../../modules/parser/ParsingContext';
import { NodeTypes } from '../../modules/req/NodeTypes';
import { TestCaseParser } from "../../modules/parser/TestCaseParser";

describe( 'TestCaseParser', () => {

    let parser = new TestCaseParser(); // under test

    let context: ParsingContext = null;
    let nodes: Node[] = [];
    let nodeIt: NodeIterator = null;
    let errors: Error[] = [];

    let featureNode: Feature = {
        nodeType: NodeTypes.FEATURE,
        location: { column: 1, line: 1 },
        name: "My feature"
    };

    let testCaseNode: TestCase = {
        nodeType: NodeTypes.TEST_CASE,
        location: { column: 1, line: 2 },
        name: "My testCase",
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

    it( 'adds a test case to a feature when a feature exists', () => {
        context.doc.feature = featureNode;
        parser.analyze( testCaseNode, context, nodeIt, errors );
        expect( errors ).toHaveLength( 0 );
        expect( context.doc.testCases ).toHaveLength( 1 );
    } );

    it( 'context indicates the presence of a test case', () => {
        context.doc.feature = featureNode;
        expect( context.inTestCase ).toBeFalsy();
        parser.analyze( testCaseNode, context, nodeIt, errors );
        expect( context.inTestCase ).toBeTruthy();
    } );

} );