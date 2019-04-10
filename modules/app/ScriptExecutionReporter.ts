import { TestScriptExecutionResult } from "concordialang-types";

/**
 * Script execution reporter
 *
 * @author Thiago Delgado Pinto
 */
export interface ScriptExecutionReporter {

    scriptExecuted( r: TestScriptExecutionResult ): void;
}