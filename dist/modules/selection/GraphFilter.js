"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Graph = require("graph.js/dist/graph.full.js");
const events_1 = require("events");
var GraphFilterEvent;
(function (GraphFilterEvent) {
    GraphFilterEvent["DOCUMENT_NOT_INCLUDED"] = "concordia:documentNotIncluded";
})(GraphFilterEvent = exports.GraphFilterEvent || (exports.GraphFilterEvent = {}));
/**
 * Graph filter.
 *
 * @author Thiago Delgado Pinto
 */
class GraphFilter extends events_1.EventEmitter {
    /**
     * Creates a new graph containing the documents that match the evaluation function.
     *
     * @param graph Original specification graph.
     * @param shouldBeIncluded Evaluation function.
     * @returns A new graph.
     */
    filter(graph, shouldBeIncluded) {
        // Creates a new graph
        let newGraph = new Graph();
        // Iterates the original graph in topological order
        for (let [key, value] of graph.vertices_topologically()) {
            const doc = value;
            if (!shouldBeIncluded(doc, graph)) {
                this.emit(GraphFilterEvent.DOCUMENT_NOT_INCLUDED, doc);
                continue;
            }
            // Add a vertex for the document (overwrites if already exist)
            const fromKey = doc.fileInfo.path;
            newGraph.addVertex(fromKey, doc); // key, value
            // Add edges that leaves the document.
            // This iterates over all outgoing edges of the `from` vertex.
            for (let [toKey, vertexValue] of graph.verticesFrom(fromKey)) {
                newGraph.ensureVertex(toKey, vertexValue);
                newGraph.ensureEdge(fromKey, toKey);
            }
        }
        return newGraph;
    }
}
exports.GraphFilter = GraphFilter;
//# sourceMappingURL=GraphFilter.js.map