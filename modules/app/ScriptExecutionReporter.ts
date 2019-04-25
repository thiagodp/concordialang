import { TestScriptExecutionResult } from "concordialang-plugin";

/**
 * Script execution reporter
 *
 * @author Thiago Delgado Pinto
 */
export interface ScriptExecutionReporter {

    scriptExecuted( r: TestScriptExecutionResult ): void;
}