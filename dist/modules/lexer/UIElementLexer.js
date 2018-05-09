"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NamedNodeLexer_1 = require("./NamedNodeLexer");
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Detects a UI Element.
 *
 * @author Thiago Delgado Pinto
 */
class UIElementLexer extends NamedNodeLexer_1.NamedNodeLexer {
    constructor(words) {
        super(words, NodeTypes_1.NodeTypes.UI_ELEMENT);
    }
    /** @inheritDoc */
    suggestedNextNodeTypes() {
        return [NodeTypes_1.NodeTypes.UI_PROPERTY];
    }
}
exports.UIElementLexer = UIElementLexer;
//# sourceMappingURL=UIElementLexer.js.map