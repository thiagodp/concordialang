import { MultiFileProcessor, MultiFileProcessedData } from "./MultiFileProcessor";
import { Options } from "./Options";
import { CLI } from "./CLI";
import { BatchSpecificationAnalyzer } from "../semantic/BatchSpecificationAnalyzer";
import { Spec } from "../ast/Spec";
import { Document } from "../ast/Document";
import { LocatedException } from "../req/LocatedException";
import { CompilerListener, ProcessingInfo } from "./CompilerListener";
import { Warning } from "../req/Warning";
import { SpecFilter } from "../selection/SpecFilter";
import { isDefined } from "../util/TypeChecking";

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

    public compile = async ( options: Options, listener: CompilerListener ): Promise< Spec > => {

        listener.displayOptions( options );

        let startTime: number = Date.now();

        const r: MultiFileProcessedData = await this._mfp.process( options );
        const compiledFilesCount = r.compiledFiles.length;

        // Create the specification
        let spec = new Spec( options.directory );

        // Add the documents
        for ( let file of r.compiledFiles ) {
            let doc: Document = file.content as Document;
            spec.docs.push( doc );
        }

        // Then filter the specification
        const specFilter = new SpecFilter( spec );
        // if ( isDefined( options.runMinFeature ) ) {
        //     //...
        //     specFilter.filter( ... );
        // }
        let graph = specFilter.graph();

        if ( compiledFilesCount > 0 ) {

            listener.semanticAnalysisStarted();

            // Perform semantic analysis
            startTime = Date.now();
            let semanticErrors: LocatedException[] = [];
            await this._specificationAnalyzer.analyze( graph, spec, semanticErrors );

            listener.semanticAnalysisFinished( new ProcessingInfo( Date.now() - startTime, semanticErrors, [] ) );
        }

        // Perform logic analysis
        // TO-DO

        return spec;
    };

}