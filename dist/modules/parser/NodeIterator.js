"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Node iterator.
 *
 * @author Thiago Delgado Pinto
 */
class NodeIterator {
    constructor(_nodes, _index = -1) {
        this._nodes = _nodes;
        this._index = _index;
    }
    first() {
        this._index = -1;
    }
    hasCurrent() {
        return this._index >= 0 && this._index < this._nodes.length;
    }
    current() {
        if (!this.hasCurrent()) {
            return null;
        }
        return this._nodes[this._index];
    }
    hasNext() {
        return (this._index + 1) < this._nodes.length;
    }
    next() {
        if (!this.hasNext()) {
            return null;
        }
        return this._nodes[++this._index];
    }
    spyNext() {
        if (!this.hasNext()) {
            return null;
        }
        return this._nodes[this._index + 1]; // it does not change the index !
    }
    hasPrior() {
        return this._index > 0;
    }
    prior() {
        if (!this.hasPrior()) {
            return null;
        }
        return this._nodes[--this._index];
    }
    spyPrior() {
        if (!this.hasPrior()) {
            return null;
        }
        return this._nodes[this._index - 1]; // it does not change the index !
    }
    clone() {
        return new NodeIterator(this._nodes, this._index);
    }
    nodes(newNodes) {
        if (newNodes) {
            this._nodes = newNodes;
            this.first();
        }
        return this._nodes;
    }
}
exports.NodeIterator = NodeIterator;
