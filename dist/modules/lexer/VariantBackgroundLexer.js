"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
const BlockLexer_1 = require("./BlockLexer");
/**
 * Detects a Variant Background block.
 *
 * @author Thiago Delgado Pinto
 */
class VariantBackgroundLexer extends BlockLexer_1.BlockLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.VARIANT_BACKGROUND);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_GIVEN, NodeTypes_1.NodeTypes.SCENARIO, NodeTypes_1.NodeTypes.VARIANT];
    }
}
exports.VariantBackgroundLexer = VariantBackgroundLexer;
