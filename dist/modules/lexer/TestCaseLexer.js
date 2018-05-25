"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
const NamedNodeLexer_1 = require("./NamedNodeLexer");
/**
 * Detects a TestCase.
 *
 * @author Thiago Delgado Pinto
 */
class TestCaseLexer extends NamedNodeLexer_1.NamedNodeLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.TEST_CASE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_GIVEN];
    }
}
exports.TestCaseLexer = TestCaseLexer;
