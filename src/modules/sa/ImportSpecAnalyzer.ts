import { SemanticException } from './SemanticException';
import { NodeBasedSpecAnalyzer } from './NodeBasedSpecAnalyzer';
import { Spec } from "../ast/Spec";
import { Document } from "../ast/Document";
import { LocatedException } from "../req/LocatedException";

var Graph = require( 'graph.js/dist/graph.full.js' );

/**
 * Import semantic analyzer for a specification.
 * 
 * @author Thiago Delgado Pinto
 */
export class ImportSpecAnalyzer implements NodeBasedSpecAnalyzer {

    private _graph = new Graph();

    /** @inheritDoc */
    public analyze( spec: Spec, errors: LocatedException[] ) {
        this.findCyclicReferences( spec, errors );
    }

    private findCyclicReferences( spec: Spec, errors: LocatedException[] ) {
        this.buildGraphWithTheSpec( this._graph, spec );
        // Let's find cyclic references and report them as errors
        for ( let cycle of this._graph.cycles() ) {
            console.log( cycle );
            let filePath = cycle;

            // Prepare the error
            let msg = 'Cyclic reference in the file "' + filePath + '".';
            let err = new SemanticException( msg, { line: 1, column: 1 } ); // <<< TO-DO: fix position?

            // Add the error to the detected errors
            errors.push( err );

            // Let's also add the error to the document

            let doc: Document = this._graph.vertexValue( filePath ); // cycle is a key (that is the file path)
            if ( ! doc ) {
                // This should not happen, since all the imported files are checked before,
                // by the import single document analyzer (class ImportSDA).
                // Let's represent this as an error, instead of just ignoring it.

                let docError = new SemanticException(
                    'Imported file "' + filePath + '" should have a document.',
                    { line: 1, column: 1 }
                    );

                errors.push( docError );

                continue;
            }
            if ( ! doc.fileErrors ) {
                doc.fileErrors = [];
            }
            doc.fileErrors.push( err );
        }
    }

    private buildGraphWithTheSpec( graph: Graph, spec: Spec ) {
        // Remove all the vertices and edges
        graph.clear();
        // Build the graph
        for ( let doc of spec.docs ) {
            let fromKey = doc.fileInfo.path; // key
            // Add the document as a vertex. If the key already exists, the value is overwriten.
            graph.addVertex( fromKey, doc ); // key, value
            // Make each imported file a vertex, but not overwrite the value if it already exists.
            for ( let imp of doc.imports ) {
                let toKey = imp.content; // key
                graph.ensureVertex( toKey ); // no value
                // Make an edge from the doc to the imported file.
                // If the edge already exists, do nothing.
                graph.ensureEdge( fromKey, toKey );
            }
        }
    }

}