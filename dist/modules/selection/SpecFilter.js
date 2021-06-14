import { EventEmitter } from 'events';
import { ImportBasedGraphBuilder } from '../compiler/ImportBasedGraphBuilder';
import { GraphFilter, GraphFilterEvent } from './GraphFilter';
/**
 * Specification filter
 *
 * @author Thiago Delgado Pinto
 */
export class SpecFilter extends EventEmitter {
    constructor(_spec) {
        super();
        this._spec = _spec;
        this._graphFilter = new GraphFilter();
        this._graph = null;
    }
    filter(fn) {
        // Adds a listener for excluded documents, in order to remove them from the specification
        this._graphFilter.addListener(GraphFilterEvent.DOCUMENT_NOT_INCLUDED, (doc) => {
            this.emit(GraphFilterEvent.DOCUMENT_NOT_INCLUDED);
            this.removeDocumentFromSpecification(doc);
        });
        // Overwrites the current graph with the filtered one
        this._graph = this._graphFilter.filter(this.graph(), fn);
        // Removes listeners from the graph filter
        this._graphFilter.removeAllListeners();
        // Clear specification cache
        this._spec.clearCache();
        return this;
    }
    graph() {
        if (!this._graph) {
            this._graph = this.createGraph();
        }
        return this._graph;
    }
    reset() {
        this.removeAllListeners();
        this._graph = this.createGraph();
        return this;
    }
    createGraph() {
        // Build a graph from the documents and its Imports, since it is expected
        // that references to another document's declarations need Imports.
        // Cyclic references are validated previously, by the ImportSSA.
        return (new ImportBasedGraphBuilder()).buildFrom(this._spec);
    }
    removeDocumentFromSpecification(doc) {
        const pos = this._spec.docs.indexOf(doc);
        if (pos >= 0) {
            this._spec.docs.splice(pos, 1);
        }
    }
}
