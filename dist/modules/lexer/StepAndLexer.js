"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepAndLexer = void 0;
const NodeTypes_1 = require("../req/NodeTypes");
const StartingKeywordLexer_1 = require("./StartingKeywordLexer");
/**
 * Detects an And node.
 *
 * @author Thiago Delgado Pinto
 */
class StepAndLexer extends StartingKeywordLexer_1.StartingKeywordLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.STEP_AND);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_AND, NodeTypes_1.NodeTypes.STEP_WHEN, NodeTypes_1.NodeTypes.STEP_THEN];
    }
}
exports.StepAndLexer = StepAndLexer;
