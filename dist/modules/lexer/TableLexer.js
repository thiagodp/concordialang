"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableLexer = void 0;
const NodeTypes_1 = require("../req/NodeTypes");
const NamedNodeLexer_1 = require("./NamedNodeLexer");
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
