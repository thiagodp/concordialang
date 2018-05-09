"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
const SyntaticException_1 = require("../req/SyntaticException");
/**
 * Database property parser.
 *
 * @author Thiago Delgado Pinto
 */
class DatabasePropertyParser {
    /** @inheritDoc */
    isAccepted(node, it) {
        const allowedPriorNodes = [
            NodeTypes_1.NodeTypes.DATABASE,
            NodeTypes_1.NodeTypes.DATABASE_PROPERTY
        ];
        return allowedPriorNodes.indexOf(it.spyPrior().nodeType) >= 0;
    }
    /** @inheritDoc */
    handle(node, context, errors) {
        // Adjusts the node type
        node.nodeType = NodeTypes_1.NodeTypes.DATABASE_PROPERTY;
        // Checks the context
        if (!context.currentDatabase) {
            let e = new SyntaticException_1.SyntaticException('The "' + node.nodeType + '" clause must be declared for a Database.', node.location);
            errors.push(e);
            return false;
        }
        // Adjust the context
        context.resetInValues();
        // Checks the structure
        if (!context.currentDatabase.items) {
            context.currentDatabase.items = [];
        }
        // Adds the node        
        context.currentDatabase.items.push(node);
        return true;
    }
}
exports.DatabasePropertyParser = DatabasePropertyParser;
//# sourceMappingURL=DatabasePropertyParser.js.map