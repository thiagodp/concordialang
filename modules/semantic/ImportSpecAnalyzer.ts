import { Location } from '../ast/Location';
import { SemanticException } from './SemanticException';
import { NodeBasedSpecAnalyzer } from './NodeBasedSpecAnalyzer';
import { Spec } from "../ast/Spec";
import { Document } from "../ast/Document";
import { LocatedException } from "../req/LocatedException";

const Graph = require( 'graph.js/dist/graph.full.js' );
const path = require( 'path' );

/**
 * Import semantic analyzer.
 * 
 * Checkings:
 * - cyclic references
 * 
 * @author Thiago Delgado Pinto
 */
export class ImportSpecAnalyzer extends NodeBasedSpecAnalyzer {

    private _graph = new Graph();

    /** @inheritDoc */
    public async analyze( spec: Spec, errors: LocatedException[] ): Promise< void > {
        this.findCyclicReferences( spec, errors );
    }

    private findCyclicReferences( spec: Spec, errors: LocatedException[] ) {

        this.buildGraphWithTheSpec( this._graph, spec );      

        // Let's find cyclic references and report them as errors
        for ( let it = this._graph.cycles(), kv; !(kv = it.next()).done;) {
            let cycle = kv.value;
        
            let filePath = cycle[ 0 ]; // first file

            let fullCycle = cycle.join( '" => "' ) + '" => "' + filePath;

            let doc: Document = this._graph.vertexValue( filePath ); // cycle is a key (that is the file path)
            let loc = { line: 1, column: 1 };
            if ( doc ) {
                // The second file is the imported one, so let's find its location.
                loc = this.locationOfTheImport( doc, cycle[ 1 ] );
            }

            // Prepare the error
            let msg = 'Cyclic reference: "' + fullCycle + '".';
            let err = new SemanticException( msg, loc );

            // Add the error to the detected errors
            errors.push( err );

            // Let's add the error to the document
            if ( doc ) {
                if ( ! doc.fileErrors ) {
                    doc.fileErrors = [];
                }
                doc.fileErrors.push( err );                
            } else {
                // This should not happen, since all the imported files are checked before,
                // by the "import single document analyzer" (class ImportSDA).
                // So let's represent this as an error, instead of just ignoring it.
                let docError = new SemanticException(
                    'Imported file "' + filePath + '" should have a document.',
                    { line: 1, column: 1 }
                    );
                errors.push( docError );
            }
        }
    }

    private buildGraphWithTheSpec( graph: any, spec: Spec ) {
        // Remove all the vertices and edges
        graph.clear();
        // Build the graph
        for ( let doc of spec.docs ) {

            // Sanity checking
            if ( ! doc.imports ) {
                continue;
            }

            let fromKey = doc.fileInfo.path; // key
            // Add the document as a vertex. If the key already exists, the value is overwriten.
            graph.addVertex( fromKey, doc ); // key, value
            // Make each imported file a vertex, but not overwrite the value if it already exists.
            for ( let imp of doc.imports ) {
                let toKey = imp.resolvedPath; // key
                graph.ensureVertex( toKey ); // no value
                // Make an edge from the doc to the imported file.
                // If the edge already exists, do nothing.
                graph.ensureEdge( fromKey, toKey );
            }
        }
    }


    private locationOfTheImport( doc: Document, importFile: string ): Location {
        if ( doc.imports ) {
            let fileName = path.basename( importFile ); // name without dir
            for ( let imp of doc.imports ) {
                let currentFileName = path.basename( imp.value ); // filename without dir
                if ( fileName == currentFileName ) {
                    return imp.location;
                }
            }
        }
        return { line: 1, column: 1 }; // import not found, so let's return the first position in the file
    }

}