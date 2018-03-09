import { Document } from "../ast/Document";
import Graph from 'graph.js';

/**
 * Graph filter.
 * 
 * @author Thiago Delgado Pinto
 */
export class GraphFilter {

    /**
     * Creates a new graph containing the documents that match the evaluation function.
     * 
     * @param graph Original specification graph.
     * @param shouldBeIncluded Evaluation function.
     * @returns A new graph.
     */
    filter(
        graph: Graph,
        shouldBeIncluded: ( doc: Document, graph: Graph ) => boolean
    ): Graph {

        // Creates a new graph
        let filteredGraph = new Graph();

        // Iterates the original graph in topological order
        for ( let [ key, value ] of graph.vertices_topologically() ) {

            const doc: Document = value as Document;
            if ( ! shouldBeIncluded( doc, graph ) ) {
                continue;
            }          

            // Add the document as a vertex, using it file path as the key.
            // If the key already exists, the value is overwriten.
            const fromKey = doc.fileInfo.path;
            filteredGraph.addVertex( fromKey, doc ); // key, value
            
            // Add edges that leaves the document.
            // This iterates over all outgoing edges of the `from` vertex.
            for ( let [ toKey, vertexValue ] of graph.verticesFrom( fromKey ) ) {
                filteredGraph.ensureVertex( toKey, vertexValue );
                filteredGraph.ensureEdge( fromKey, toKey );
            }
        }

        return filteredGraph;
    }

}