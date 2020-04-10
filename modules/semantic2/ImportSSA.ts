import Graph = require('graph.js/dist/graph.full.js');
import { Location } from 'concordialang-types';
import { basename } from 'path';
import { Document } from '../ast/Document';
import { ProblemMapper, SemanticException } from '../error';
import { AugmentedSpec } from '../req/AugmentedSpec';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';


/**
 * Executes semantic analysis of Imports in a specification.
 *
 * It checks for:
 * - cyclic references
 *
 * @author Thiago Delgado Pinto
 */
export class ImportSSA extends SpecificationAnalyzer {

    /** @inheritDoc */
    public async analyze(
        problems: ProblemMapper,
        spec: AugmentedSpec,
        graph: Graph,
    ): Promise< boolean > {
        return this.findCyclicReferences( problems, graph );
    }

    private findCyclicReferences( problems: ProblemMapper, graph: Graph ): boolean {

        let hasError: boolean = false;

        // Let's find cyclic references and report them as errors
        for ( let it = graph.cycles(), kv; ! ( kv = it.next() ).done; ) {

            hasError = true;

            const cycle = kv.value;
            const filePath = cycle[ 0 ]; // first file
            const fullCycle = cycle.join( '" => "' ) + '" => "' + filePath;

            const doc: Document = graph.vertexValue( filePath ); // cycle is a key (that is the file path)
            let loc = { line: 1, column: 1 };
            if ( doc ) {
                // The second file is the imported one, so let's find its location.
                loc = this.locationOfTheImport( doc, cycle[ 1 ] );
            }

            const msg = 'Cyclic reference: "' + fullCycle + '".';
            const err = new SemanticException( msg, loc );
            problems.addError( filePath, err );
        }

        return hasError;
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