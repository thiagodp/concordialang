import { ProblemMapper } from "../error/ProblemMapper";
import { Options } from "../app/Options";

export interface CompilerListener {

    announceFileSearchStarted(): void;
    announceFileSearchFinished( durationMS: number, files: string[] ): void;

    announceCompilerStarted( options: Options ): void;

    announceCompilerFinished(
        compiledFilesCount: number,
        featuresCount: number,
        testCasesCount: number,
        durationMS: number
        ): void;

    reportProblems( problems: ProblemMapper, basePath: string ): void;

}