import { MultiFileProcessor, MultiFileProcessedData } from "./MultiFileProcessor";
import { Options } from "./Options";
import { CLI } from "./CLI";
import { SpecAnalyzer } from "../semantic/SpecAnalyzer";
import { Spec } from "../ast/Spec";
import { Document } from "../ast/Document";
import { LocatedException } from "../req/LocatedException";
import { CompilerListener, ProcessingInfo } from "./CompilerListener";
import { Warning } from "../req/Warning";

export class Compiler {

    constructor(
        private _mfp: MultiFileProcessor,
        private _specAnalyzer: SpecAnalyzer
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

            /*
            // Show individual document errors
            let errors = this.sortErrorsByLocation( doc.fileErrors );
            let warnings = this.sortErrorsByLocation( doc.fileWarnings );

            listener.showIndividualCompilationResults(
                file.meta,
                new ProcessingInfo( file.durationMs, errors, warnings )
            );
            */
        }

        if ( compiledFilesCount > 0 ) {
            // Perform semantic analysis
            startTime = Date.now();
            listener.semanticAnalysisStarted();
            let semanticErrors: LocatedException[] = [];

            await this._specAnalyzer.analyze( spec, semanticErrors );

            listener.semanticAnalysisFinished( new ProcessingInfo( Date.now() - startTime, semanticErrors, [] ) );
        }
        
        // Perform logic analysis
        // TO-DO    

        return spec;
    };


    private sortErrorsByLocation( errors: LocatedException[] ): LocatedException[] {
        return Array.sort( errors, ( a: LocatedException, b: LocatedException ) => {
            if ( a.location && b.location ) {
                // Compare the line
                let lineDiff: number = a.location.line - b.location.line;
                if ( 0 === lineDiff ) { // Same line, so let's compare the column
                    return a.location.column - b.location.column;
                }
                return lineDiff;
            }
            // No location, so let's compare the error type
            let aIsWarning = a.name === Warning.name;
            let bIsWarning = b.name === Warning.name;
            // Both are warnings, they are equal
            if ( aIsWarning && bIsWarning ) {
                return 0;
            }
            return aIsWarning ? 1 : -1;
        } );
    }    

}