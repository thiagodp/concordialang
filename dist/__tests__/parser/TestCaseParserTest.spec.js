"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeIterator_1 = require("../../modules/parser/NodeIterator");
const ParsingContext_1 = require("../../modules/parser/ParsingContext");
const NodeTypes_1 = require("../../modules/req/NodeTypes");
const TestCaseParser_1 = require("../../modules/parser/TestCaseParser");
/**
 * @author Thiago Delgado Pinto
 */
describe('TestCaseParserTest', () => {
    let parser = new TestCaseParser_1.TestCaseParser(); // under test
    let context = null;
    let nodes = [];
    let nodeIt = null;
    let errors = [];
    let featureNode = {
        nodeType: NodeTypes_1.NodeTypes.FEATURE,
        location: { column: 1, line: 1 },
        name: "My feature"
    };
    let testCaseNode = {
        nodeType: NodeTypes_1.NodeTypes.TEST_CASE,
        location: { column: 1, line: 2 },
        name: "My testCase",
        sentences: []
    };
    beforeEach(() => {
        nodes = [];
        nodeIt = new NodeIterator_1.NodeIterator(nodes);
        errors = [];
        context = new ParsingContext_1.ParsingContext();
    });
    it('generates an error when a test case is added without a feature', () => {
        expect(context.doc.feature).not.toBeDefined();
        parser.analyze(testCaseNode, context, nodeIt, errors);
        expect(errors).toHaveLength(1);
    });
    it('adds a test case to a feature when a feature exists', () => {
        context.doc.feature = featureNode;
        parser.analyze(testCaseNode, context, nodeIt, errors);
        expect(errors).toHaveLength(0);
        expect(context.doc.testCases).toHaveLength(1);
    });
    it('context indicates the presence of a test case', () => {
        context.doc.feature = featureNode;
        expect(context.inTestCase).toBeFalsy();
        parser.analyze(testCaseNode, context, nodeIt, errors);
        expect(context.inTestCase).toBeTruthy();
    });
});
//# sourceMappingURL=TestCaseParserTest.spec.js.map