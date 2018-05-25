"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StartingKeywordLexer_1 = require("./StartingKeywordLexer");
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Detects a Then node.
 *
 * @author Thiago Delgado Pinto
 */
class StepThenLexer extends StartingKeywordLexer_1.StartingKeywordLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.STEP_THEN);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_AND];
    }
}
exports.StepThenLexer = StepThenLexer;
