import { EventEmitter } from 'events';
import Graph from 'graph.js/dist/graph.full.js';

import { Document } from '../ast/Document';


export enum GraphFilterEvent {
    DOCUMENT_NOT_INCLUDED = 'concordia:documentNotIncluded'
}

/**
 * Graph filter.
 *
 * @author Thiago Delgado Pinto
 */
export class GraphFilter extends EventEmitter {

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
        let newGraph = new Graph();

        // Iterates the original graph in topological order
        for ( let [ /* key */, value ] of graph.vertices_topologically() ) {

            const doc: Document = value as Document;
            if ( ! shouldBeIncluded( doc, graph ) ) {
                this.emit( GraphFilterEvent.DOCUMENT_NOT_INCLUDED, doc );
                continue;
            }

            // Add a vertex for the document (overwrites if already exist)
            const fromKey = doc.fileInfo.path;
            newGraph.addVertex( fromKey, doc ); // key, value

            // Add edges that leaves the document.
            // This iterates over all outgoing edges of the `from` vertex.
            for ( let [ toKey, vertexValue ] of graph.verticesFrom( fromKey ) ) {
                newGraph.ensureVertex( toKey, vertexValue );
                newGraph.ensureEdge( fromKey, toKey );
            }
        }

        return newGraph;
    }

}