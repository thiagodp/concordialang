import { TestScriptExecutionResult } from "concordialang-types";

/**
 * Script execution listener
 *
 * @author Thiago Delgado Pinto
 */
export interface TestScriptExecutionListener {

    testScriptExecutionDisabled(): void;

    announceTestScriptExecutionStarted(): void;
    announceTestScriptExecutionError( error: Error ): void;
    announceTestScriptExecutionFinished(): void;

    showTestScriptAnalysis( r: TestScriptExecutionResult ): void;
}