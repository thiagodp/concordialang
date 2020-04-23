import { LocatedException } from "../error/LocatedException";
import { Warning } from "../error/Warning";

export interface TestCaseGeneratorListener {

    testCaseGenerationStarted( strategyWarnings: Warning[] ): void;

    testCaseProduced(
        dirTestCases: string,
        filePath: string,
        testCasesCount: number,
        errors: LocatedException[],
        warnings: Warning[]
    ): void;

    testCaseGenerationFinished( filesCount: number, testCasesCount: number, durationMs: number ): void;
}