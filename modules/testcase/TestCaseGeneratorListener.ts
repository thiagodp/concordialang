import { LocatedException } from "../error/LocatedException";
import { Warning } from "../error/Warning";

export interface TestCaseGeneratorListener {

    testCaseGenerationStarted( warnings: Warning[] );

    testCaseProduced( path: string, errors: LocatedException[], warnings: Warning[] );

    testCaseGenerationFinished( durationMs: number );
}