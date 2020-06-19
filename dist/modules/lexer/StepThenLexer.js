"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepThenLexer = void 0;
const NodeTypes_1 = require("../req/NodeTypes");
const StartingKeywordLexer_1 = require("./StartingKeywordLexer");
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
