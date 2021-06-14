import { NodeTypes } from "../req/NodeTypes";
import { SyntacticException } from "./SyntacticException";
import { TagCollector } from './TagCollector';
/**
 * UI property parser.
 *
 * @author Thiago Delgado Pinto
 */
export class UIPropertyParser {
    /** @inheritDoc */
    isAccepted(node, it) {
        const allowedPriorNodes = [
            NodeTypes.TAG,
            NodeTypes.UI_ELEMENT,
            NodeTypes.UI_PROPERTY,
            NodeTypes.STEP_OTHERWISE,
            NodeTypes.STEP_AND
        ];
        return allowedPriorNodes.indexOf(it.spyPrior().nodeType) >= 0;
    }
    /** @inheritDoc */
    handle(node, context, it, errors) {
        // Adjusts the node type
        node.nodeType = NodeTypes.UI_PROPERTY;
        // Checks the context
        if (!context.currentUIElement) {
            const e = new SyntacticException('A "' + node.nodeType + '" is declared without a UI Element.', node.location);
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
        // Adds backward tags
        if (!uiProperty.tags) {
            uiProperty.tags = [];
        }
        (new TagCollector()).addBackwardTags(it, uiProperty.tags);
        // Adds the node
        context.currentUIElement.items.push(uiProperty);
        return true;
    }
}
