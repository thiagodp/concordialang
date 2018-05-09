"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ScenarioParser_1 = require("../../modules/parser/ScenarioParser");
const NodeIterator_1 = require("../../modules/parser/NodeIterator");
const ParsingContext_1 = require("../../modules/parser/ParsingContext");
const NodeTypes_1 = require("../../modules/req/NodeTypes");
/**
 * @author Thiago Delgado Pinto
 */
describe('ScenarioParserTest', () => {
    let parser = new ScenarioParser_1.ScenarioParser(); // under test
    let context = null;
    let nodes = [];
    let nodeIt = null;
    let errors = [];
    let featureNode = {
        nodeType: NodeTypes_1.NodeTypes.FEATURE,
        location: { column: 1, line: 1 },
        name: "My feature"
    };
    let scenarioNode = {
        nodeType: NodeTypes_1.NodeTypes.SCENARIO,
        location: { column: 1, line: 2 },
        name: "My scenario",
        sentences: []
    };
    beforeEach(() => {
        nodes = [];
        nodeIt = new NodeIterator_1.NodeIterator(nodes);
        errors = [];
        context = new ParsingContext_1.ParsingContext();
    });
    it('generates an error when a scenario is added without a feature', () => {
        expect(context.doc.feature).not.toBeDefined();
        parser.analyze(scenarioNode, context, nodeIt, errors);
        expect(errors).toHaveLength(1);
    });
    it('adds an scenario to a feature whether a feature exists', () => {
        context.doc.feature = featureNode;
        parser.analyze(scenarioNode, context, nodeIt, errors);
        expect(errors).toHaveLength(0);
        expect(context.doc.feature.scenarios).toHaveLength(1);
    });
    it('indicates that it is in a scenario when a scenario is detected', () => {
        context.doc.feature = featureNode;
        expect(context.inScenario).toBeFalsy();
        parser.analyze(scenarioNode, context, nodeIt, errors);
        expect(context.inScenario).toBeTruthy();
    });
});
//# sourceMappingURL=ScenarioParserTest.spec.js.map