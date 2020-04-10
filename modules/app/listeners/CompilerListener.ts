import { Options } from "../Options";
import { ProblemMapper } from "../../error/ProblemMapper";

export interface CompilerListener {

    compilerStarted( options: Options );

    compilationFinished(
        givenFilesCount: number,
        compiledFilesCount: number,
        durationMS: number
        );

    reportProblems( problems: ProblemMapper, basePath: string ): void;

}