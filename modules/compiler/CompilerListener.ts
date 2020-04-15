import { ProblemMapper } from "../error/ProblemMapper";
import { Options } from "../app/Options";

export interface CompilerListener {

    compilerStarted( options: Options );

    compilationFinished( durationMS: number );

    reportProblems( problems: ProblemMapper, basePath: string ): void;

}