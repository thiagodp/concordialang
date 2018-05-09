"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
const NamePlusNumberNodeLexer_1 = require("./NamePlusNumberNodeLexer");
/**
 * Detects a Variant.
 *
 * @author Thiago Delgado Pinto
 */
class VariantLexer extends NamePlusNumberNodeLexer_1.NamePlusNumberNodeLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.VARIANT);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.STEP_GIVEN];
    }
}
exports.VariantLexer = VariantLexer;
//# sourceMappingURL=VariantLexer.js.map