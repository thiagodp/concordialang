"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../req/NodeTypes");
/**
 * Text collector
 *
 * @author Thiago Delgado Pinto
 */
class TextCollector {
    /**
     * Add forward text nodes.
     *
     * @param it Node iterator
     * @param target Where to put the nodes found.
     * @param changeIterator If the iterator can be changed.
     */
    addForwardTextNodes(it, target, changeIterator = false) {
        let nodeIt = changeIterator ? it : it.clone();
        while (nodeIt.hasNext() && nodeIt.spyNext().nodeType === NodeTypes_1.NodeTypes.TEXT) {
            let text = nodeIt.next();
            target.push(text);
        }
    }
}
exports.TextCollector = TextCollector;
