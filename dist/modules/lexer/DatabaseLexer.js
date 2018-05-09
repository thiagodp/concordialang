"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NamedNodeLexer_1 = require("./NamedNodeLexer");
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Detects a Database node.
 *
 * @author Thiago Delgado Pinto
 */
class DatabaseLexer extends NamedNodeLexer_1.NamedNodeLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.DATABASE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.DATABASE];
    }
}
exports.DatabaseLexer = DatabaseLexer;
//# sourceMappingURL=DatabaseLexer.js.map