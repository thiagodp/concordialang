import Graph = require('graph.js/dist/graph.full.js');
import { basename } from 'path';
import { Document, Location } from 'concordialang-types';
import { AugmentedSpec } from '../ast/AugmentedSpec';
import { SemanticException } from './SemanticException';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';

/**
 * Executes semantic analysis of Imports in a specification.
 *
 * Checkings:
 * - cyclic references
 *
 * @author Thiago Delgado Pinto
 */
export class ImportSSA extends SpecificationAnalyzer {

    /** @inheritDoc */
    public async analyze(
        graph: Graph,
        spec: AugmentedSpec,
        errors: SemanticException[]
    ): Promise< void > {
        this.findCyclicReferences( graph, spec, errors );
    }

    private findCyclicReferences( graph: Graph, spec: AugmentedSpec, errors: SemanticException[] ) {

        // Let's find cyclic references and report them as errors
        for ( let it = graph.cycles(), kv; ! ( kv = it.next() ).done; ) {
            let cycle = kv.value;

            let filePath = cycle[ 0 ]; // first file

            let fullCycle = cycle.join( '" => "' ) + '" => "' + filePath;

            let doc: Document = graph.vertexValue( filePath ); // cycle is a key (that is the file path)
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

    private locationOfTheImport( doc: Document, importFile: string ): Location {
        if ( doc.imports ) {
            let fileName = basename( importFile ); // name without dir
            for ( let imp of doc.imports ) {
                let currentFileName = basename( imp.value ); // filename without dir
                if ( fileName == currentFileName ) {
                    return imp.location;
                }
            }
        }
        return { line: 1, column: 1 }; // import not found, so let's return the first position in the file
    }

}