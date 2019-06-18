"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntacticException_1 = require("../req/SyntacticException");
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Constant parser.
 *
 * @author Thiago Delgado Pinto
 */
class ConstantParser {
    /** @inheritDoc */
    isAccepted(node, it) {
        const allowedPriorNodes = [
            NodeTypes_1.NodeTypes.CONSTANT_BLOCK,
            NodeTypes_1.NodeTypes.CONSTANT
        ];
        return allowedPriorNodes.indexOf(it.spyPrior().nodeType) >= 0;
    }
    /** @inheritDoc */
    handle(node, context, it, errors) {
        // Adjusts the node type
        node.nodeType = NodeTypes_1.NodeTypes.CONSTANT;
        // Checks the context
        if (!context.currentConstantBlock
            || (!context.inConstantBlock && !context.inConstant)) {
            let e = new SyntacticException_1.SyntacticException('The "' + node.nodeType + '" clause must be declared inside a Constants block.', node.location);
            errors.push(e);
            return false;
        }
        // Adjusts the context
        context.resetInValues();
        context.inConstant = true;
        // Checks the structure
        if (!context.currentConstantBlock.items) {
            context.currentConstantBlock.items = [];
        }
        // Adds the node
        context.currentConstantBlock.items.push(node);
        return true;
    }
}
exports.ConstantParser = ConstantParser;
