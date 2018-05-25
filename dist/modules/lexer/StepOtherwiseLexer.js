"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StartingKeywordLexer_1 = require("./StartingKeywordLexer");
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Detects an Otherwise node.
 *
 * @author Thiago Delgado Pinto
 */
class StepOtherwiseLexer extends StartingKeywordLexer_1.StartingKeywordLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.STEP_OTHERWISE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_AND];
    }
}
exports.StepOtherwiseLexer = StepOtherwiseLexer;
