"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NamedNodeLexer_1 = require("./NamedNodeLexer");
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Detects a Table.
 *
 * @author Thiago Delgado Pinto
 */
class TableLexer extends NamedNodeLexer_1.NamedNodeLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.TABLE);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.TABLE_ROW];
    }
}
exports.TableLexer = TableLexer;
//# sourceMappingURL=TableLexer.js.map