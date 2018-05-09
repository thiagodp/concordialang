"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QuotedNodeLexer_1 = require("./QuotedNodeLexer");
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Detects an Import.
 *
 * @author Thiago Delgado Pinto
 */
class ImportLexer extends QuotedNodeLexer_1.QuotedNodeLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.IMPORT);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.FEATURE, NodeTypes_1.NodeTypes.VARIANT];
    }
}
exports.ImportLexer = ImportLexer;
//# sourceMappingURL=ImportLexer.js.map