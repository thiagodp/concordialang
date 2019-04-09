import { TestScriptExecutionResult } from "concordialang-types/testscript";

/**
 * Script execution reporter
 *
 * @author Thiago Delgado Pinto
 */
export interface ScriptExecutionReporter {

    scriptExecuted( r: TestScriptExecutionResult ): void;
}