"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NamedNodeLexer_1 = require("./NamedNodeLexer");
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Detects a Feature.
 *
 * @author Thiago Delgado Pinto
 */
class FeatureLexer extends NamedNodeLexer_1.NamedNodeLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.FEATURE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.SCENARIO];
    }
}
exports.FeatureLexer = FeatureLexer;
//# sourceMappingURL=FeatureLexer.js.map