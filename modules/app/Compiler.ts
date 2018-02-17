import { MultiFileProcessor, MultiFileProcessedData } from "./MultiFileProcessor";
import { Options } from "./Options";
import { CLI } from "./CLI";
import { BatchSpecSemanticAnalyzer } from "../semantic/BatchSpecSemanticAnalyzer";
import { Spec } from "../ast/Spec";
import { Document } from "../ast/Document";
import { LocatedException } from "../req/LocatedException";
import { CompilerListener, ProcessingInfo } from "./CompilerListener";
import { Warning } from "../req/Warning";

/**
 * Compiler
 * 
 * @author Thiago Delgado Pinto
 */
export class Compiler {

    constructor(
        private _mfp: MultiFileProcessor,
        private _specAnalyzer: BatchSpecSemanticAnalyzer
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

        if ( compiledFilesCount > 0 ) {

            listener.semanticAnalysisStarted();

            // Perform semantic analysis
            startTime = Date.now();
            let semanticErrors: LocatedException[] = [];
            await this._specAnalyzer.analyze( spec, semanticErrors );

            listener.semanticAnalysisFinished( new ProcessingInfo( Date.now() - startTime, semanticErrors, [] ) );
        }
        
        // Perform logic analysis
        // TO-DO    

        return spec;
    };

}