import { LocatedException } from "../req/LocatedException";
import { FileMeta } from "./SingleFileProcessor";
import { Options } from "./Options";


export class ProcessingInfo {
    constructor(
        public durationMs: number,
        public errors: LocatedException[],
        public warnings:LocatedException[]
    ) {
    }
}

export interface CompilerListener {

    compilerStarted( options: Options );

    semanticAnalysisStarted();
    semanticAnalysisFinished( info: ProcessingInfo );

}