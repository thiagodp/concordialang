import { LocatedException } from "../dbi/LocatedException";
import { Warning } from "../req/Warning";

export interface TCGenListener {

    testCaseGenerationStarted( warnings: Warning[] );

    testCaseProduced( path: string, errors: LocatedException[], warnings: Warning[] );

    testCaseGenerationFinished( durationMs: number );
}