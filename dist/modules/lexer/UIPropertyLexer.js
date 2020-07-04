"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIPropertyLexer = void 0;
const NodeTypes_1 = require("../req/NodeTypes");
const ListItemLexer_1 = require("./ListItemLexer");
/**
 * Detects a UIProperty node.
 *
 * @author Thiago Delgado Pinto
 */
class UIPropertyLexer extends ListItemLexer_1.ListItemLexer {
    constructor() {
        super(NodeTypes_1.NodeTypes.UI_PROPERTY);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.UI_PROPERTY];
    }
}
exports.UIPropertyLexer = UIPropertyLexer;
