import { TestScriptExecutionResult } from "../testscript/TestScriptExecution";

/**
 * Script execution reporter
 * 
 * @author Thiago Delgado Pinto
 */
export interface ScriptExecutionReporter {

    report( r: TestScriptExecutionResult ): void;
}