"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
const ListItemLexer_1 = require("./ListItemLexer");
/**
 * DatabaseProperty lexer.
 *
 * @author Thiago Delgado Pinto
 */
class DatabasePropertyLexer extends ListItemLexer_1.ListItemLexer {
    constructor() {
        super(NodeTypes_1.NodeTypes.DATABASE_PROPERTY);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.DATABASE_PROPERTY];
    }
}
exports.DatabasePropertyLexer = DatabasePropertyLexer;
