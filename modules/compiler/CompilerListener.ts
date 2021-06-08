import { AppOptions } from '../app/app-options';
import { ProblemMapper } from '../error/ProblemMapper';

export interface CompilerListener {

    // Seed

    announceSeed( seed: string, generatedSeed: boolean ): void;
    announceRealSeed( realSeed: string ): void;

    // File searcher

	announceFileSearchStarted(): void;
	announceFileSearchWarnings( warnings: string[] ): void;
    announceFileSearchFinished( durationMS: number, filesFoundCount: number, filesIgnoredCount: number ): void;

    // Compiler

    announceCompilerStarted( options: AppOptions ): void;

    announceCompilerFinished(
        compiledFilesCount: number,
        featuresCount: number,
        testCasesCount: number,
        durationMS: number
        ): void;

    reportProblems( problems: ProblemMapper, basePath: string ): void;

}
