import { NodeTypes } from '../req/NodeTypes';
/**
 * Text collector
 *
 * @author Thiago Delgado Pinto
 */
export class TextCollector {
    /**
     * Add forward text nodes.
     *
     * @param it Node iterator
     * @param target Where to put the nodes found.
     * @param changeIterator If the iterator can be changed.
     */
    addForwardTextNodes(it, target, changeIterator = false) {
        let nodeIt = changeIterator ? it : it.clone();
        while (nodeIt.hasNext() && nodeIt.spyNext().nodeType === NodeTypes.TEXT) {
            let text = nodeIt.next();
            target.push(text);
        }
    }
}
