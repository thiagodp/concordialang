"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundLexer = void 0;
const NodeTypes_1 = require("../req/NodeTypes");
const BlockLexer_1 = require("./BlockLexer");
/**
 * Detects a Background block.
 *
 * @author Thiago Delgado Pinto
 */
class BackgroundLexer extends BlockLexer_1.BlockLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.BACKGROUND);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_GIVEN, NodeTypes_1.NodeTypes.VARIANT_BACKGROUND, NodeTypes_1.NodeTypes.SCENARIO];
    }
}
exports.BackgroundLexer = BackgroundLexer;
