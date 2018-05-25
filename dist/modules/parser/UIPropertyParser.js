"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
const SyntaticException_1 = require("../req/SyntaticException");
/**
 * UI property parser.
 *
 * @author Thiago Delgado Pinto
 */
class UIPropertyParser {
    /** @inheritDoc */
    isAccepted(node, it) {
        const allowedPriorNodes = [
            NodeTypes_1.NodeTypes.UI_ELEMENT,
            NodeTypes_1.NodeTypes.UI_PROPERTY,
            NodeTypes_1.NodeTypes.STEP_OTHERWISE,
            NodeTypes_1.NodeTypes.STEP_AND
        ];
        return allowedPriorNodes.indexOf(it.spyPrior().nodeType) >= 0;
    }
    /** @inheritDoc */
    handle(node, context, errors) {
        // Adjusts the node type
        node.nodeType = NodeTypes_1.NodeTypes.UI_PROPERTY;
        // Checks the context
        if (!context.currentUIElement) {
            let e = new SyntaticException_1.SyntaticException('The "' + node.nodeType + '" clause must be declared for a UI Element.', node.location);
            errors.push(e);
            return false;
        }
        // Adjusts the context
        context.resetInValues();
        context.inUIProperty = true;
        // Checks the structure
        let uiProperty = node;
        context.currentUIProperty = uiProperty;
        if (!context.currentUIElement.items) {
            context.currentUIElement.items = [];
        }
        // Adds the node
        context.currentUIElement.items.push(uiProperty);
        return true;
    }
}
exports.UIPropertyParser = UIPropertyParser;
