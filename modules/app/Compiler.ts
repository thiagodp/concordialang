import Graph = require( 'graph.js/dist/graph.full.js' );

import { Document } from "../ast/Document";
import { LocatedException } from "../dbi/LocatedException";
import { BatchSpecificationAnalyzer } from "../semantic/BatchSpecificationAnalyzer";
import { AugmentedSpec } from "../req/AugmentedSpec";
import { SpecFilter } from "../selection/SpecFilter";
import { MultiFileProcessor, MultiFileProcessedData } from "./MultiFileProcessor";
import { Options } from "./Options";
import { CompilerListener } from "./CompilerListener";
import { ProcessingInfo } from "./ProcessingInfo";

/**
 * Compiler
 *
 * @author Thiago Delgado Pinto
 */
export class Compiler {

    constructor(
        private _mfp: MultiFileProcessor,
        private _specificationAnalyzer: BatchSpecificationAnalyzer
    ) {
    }

    public compile = async ( options: Options, listener: CompilerListener ): Promise< [ AugmentedSpec, Graph ] > => {

        listener.compilerStarted( options );

        // const startTime: number = Date.now();

        const r: MultiFileProcessedData = await this._mfp.process( options );
        const compiledFilesCount = r.compiledFiles.length;

        // Create the specification
        let spec = new AugmentedSpec( options.directory );

        // Add the documents
        for ( let file of r.compiledFiles ) {
            let doc: Document = file.content as Document;
            spec.docs.push( doc );
        }

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

        if ( compiledFilesCount > 0 ) {

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
    };

}