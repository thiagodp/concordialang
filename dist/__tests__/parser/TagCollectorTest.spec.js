"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeIterator_1 = require("../../modules/parser/NodeIterator");
const TagCollector_1 = require("../../modules/parser/TagCollector");
const NodeTypes_1 = require("../../modules/req/NodeTypes");
/**
 * @author Thiago Delgado Pinto
 */
describe('TagCollectorTest', () => {
    let tc = new TagCollector_1.TagCollector(); // under test
    let lin = 1;
    let importNode = {
        nodeType: NodeTypes_1.NodeTypes.IMPORT,
        location: { line: lin++, column: 1 },
        value: "hello.world"
    };
    let tagNode1 = {
        nodeType: NodeTypes_1.NodeTypes.TAG,
        location: { line: lin++, column: 1 },
        name: 'important',
        content: null
    };
    let tagNode2 = {
        nodeType: NodeTypes_1.NodeTypes.TAG,
        location: { line: lin++, column: 1 },
        name: 'hello',
        content: 'world'
    };
    let featureNode = {
        nodeType: NodeTypes_1.NodeTypes.FEATURE,
        name: 'My feature',
        location: { line: lin++, column: 1 },
        tags: []
    };
    beforeEach(() => {
        featureNode.tags = [];
    });
    it('collects backward tags successfully', () => {
        let nodes = [importNode, tagNode1, tagNode2, featureNode];
        let iterator = new NodeIterator_1.NodeIterator(nodes, nodes.length - 1); // points to the last element
        tc.addBackwardTags(iterator, featureNode.tags);
        expect(featureNode.tags).toHaveLength(2);
        expect(featureNode.tags).toEqual([tagNode1, tagNode2]);
    });
    it('does not change the given iterator', () => {
        let nodes = [importNode, tagNode1, tagNode2, featureNode];
        let iterator = new NodeIterator_1.NodeIterator(nodes, nodes.length - 1); // points to the last element
        let currentBefore = iterator.current();
        tc.addBackwardTags(iterator, featureNode.tags);
        let currentAfter = iterator.current();
        expect(currentAfter).toEqual(currentBefore);
    });
});
//# sourceMappingURL=TagCollectorTest.spec.js.map