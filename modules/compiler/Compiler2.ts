import Graph = require( 'graph.js/dist/graph.full.js' );

import { FileSearcher } from '../util/file';
import { CompilerListener } from "../app/CompilerListener";
import { Options } from "../app/Options";
import { ProcessingInfo } from "../app/ProcessingInfo";
import { LocatedException } from "../error/LocatedException";
import { AugmentedSpec } from "../req/AugmentedSpec";
import { SpecFilter } from "../selection/SpecFilter";
import { BatchSpecificationAnalyzer } from "../semantic/BatchSpecificationAnalyzer";
import { MultiFileProcessor } from './MultiFileProcessor2';

/**
 * Compiler
 *
 * @author Thiago Delgado Pinto
 */
export class Compiler {

    constructor(
        private _fileSearcher: FileSearcher,
        private _mfp: MultiFileProcessor,
        private _specificationAnalyzer: BatchSpecificationAnalyzer
    ) {
    }

    async compile( options: Options, listener: CompilerListener ): Promise< [ AugmentedSpec, Graph ] > {

        const files: string[] = await this._fileSearcher.searchFrom( options );

        listener.compilerStarted( options );
        const spec = await this._mfp.process( files, options.directory );

        // Then filter the specification
        const specFilter = new SpecFilter( spec );
        // if ( options.hasAnySpecificationFilter() ) {

        //     specFilter.on( )

        //     if ( options.hasFeatureFilter() ) {
        //         // ...
        //     }
        //     if ( options.hasScenarioFilter() ) {
        //         // ...
        //     }
        //     if ( options.hasTagFilter() ) {
        //         // ...
        //     }
        // }
        let graph = specFilter.graph();

        if ( spec.docs.length > 0 ) {

            listener.semanticAnalysisStarted();

            // Perform semantic analysis
            const semanticAnalysisStartTime = Date.now();
            let semanticErrors: LocatedException[] = [];
            await this._specificationAnalyzer.analyze( graph, spec, semanticErrors );
            const durationMs = Date.now() - semanticAnalysisStartTime;

            listener.semanticAnalysisFinished( new ProcessingInfo( durationMs, semanticErrors, [] ) );
        }

        // Perform logic analysis
        // TO-DO

        // Announce it finished
        // const durationMs = Date.now() - startTime;
        // listener.compilerFinished( durationMs );

        return [ spec, graph ];
    }

}