"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StartingKeywordLexer_1 = require("./StartingKeywordLexer");
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Detects a Given node.
 *
 * @author Thiago Delgado Pinto
 */
class StepGivenLexer extends StartingKeywordLexer_1.StartingKeywordLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.STEP_GIVEN);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_AND, NodeTypes_1.NodeTypes.STEP_WHEN, NodeTypes_1.NodeTypes.STEP_THEN];
    }
}
exports.StepGivenLexer = StepGivenLexer;
