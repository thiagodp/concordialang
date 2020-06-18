"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
const NamedNodeLexer_1 = require("./NamedNodeLexer");
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
