import { Options } from "./Options";
import { ProcessingInfo } from "./ProcessingInfo";


export interface CompilerListener {

    compilerStarted( options: Options );

    semanticAnalysisStarted();
    semanticAnalysisFinished( info: ProcessingInfo );

}