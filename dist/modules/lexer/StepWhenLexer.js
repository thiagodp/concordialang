"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StartingKeywordLexer_1 = require("./StartingKeywordLexer");
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Detects a When node.
 *
 * @author Thiago Delgado Pinto
 */
class StepWhenLexer extends StartingKeywordLexer_1.StartingKeywordLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.STEP_WHEN);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_AND, NodeTypes_1.NodeTypes.STEP_THEN];
    }
}
exports.StepWhenLexer = StepWhenLexer;
//# sourceMappingURL=StepWhenLexer.js.map