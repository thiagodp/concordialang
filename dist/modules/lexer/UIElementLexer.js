import { NodeTypes } from "../req/NodeTypes";
import { NamedNodeLexer } from "./NamedNodeLexer";
/**
 * Detects a UI Element.
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementLexer extends NamedNodeLexer {
    constructor(words) {
        super(words, NodeTypes.UI_ELEMENT);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes.UI_PROPERTY];
    }
}
