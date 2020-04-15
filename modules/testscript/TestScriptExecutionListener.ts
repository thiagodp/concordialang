import { TestScriptExecutionResult } from "concordialang-plugin";

/**
 * Script execution listener
 *
 * @author Thiago Delgado Pinto
 */
export interface TestScriptExecutionListener {

    testScriptExecutionStarted(): void;

    testScriptExecutionDisabled(): void;

    testScriptExecutionError( error: Error ): void;

    testScriptExecutionFinished( r: TestScriptExecutionResult ): void;
}