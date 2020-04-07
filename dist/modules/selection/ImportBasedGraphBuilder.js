"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//const Graph = require( 'graph.js/dist/graph.full.js' );
const Graph = require("graph.js/dist/graph.full.js");
const file_1 = require("../util/file");
/**
 * Import-based graph builder
 *
 * @author Thiago Delgado Pinto
 */
class ImportBasedGraphBuilder {
    /**
     * Create a graph in which each vertex is identified by the
     * document path and contains a reference to a document.
     *
     * Since any references to another Feature need an Import,
     * we can use Imports to build the edges.
     *
     * @param spec Specification
     */
    buildFrom(spec) {
        let graph = new Graph();
        for (let doc of spec.docs) {
            // Use the file path as the key
            let fromKey = file_1.toUnixPath(!doc.fileInfo ? '' : doc.fileInfo.path || '');
            // console.log( 'fromKey', fromKey );
            // Add the document as a vertex. If the key already exists, the value is overwritten.
            graph.addVertex(fromKey, doc); // key, value
            // Make each imported file a vertex, but not overwrite the value if it already exists.
            for (let imp of doc.imports || []) {
                let toKey = file_1.toUnixPath(imp.resolvedPath); // key
                // console.log( 'toKey', toKey );
                graph.ensureVertex(toKey); // no value
                // Make an edge from the doc to the imported file.
                // If the edge already exists, do nothing.
                graph.ensureEdge(toKey, fromKey); // to, from !!!
            }
        }
        return graph;
    }
}
exports.ImportBasedGraphBuilder = ImportBasedGraphBuilder;
