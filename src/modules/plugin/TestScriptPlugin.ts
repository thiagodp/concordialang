import { Plugin } from './Plugin';
import { AbstractTestScript } from '../ts/AbstractTestScript';
import { TestScriptGenerationOptions, TestScriptGenerationResult } from "../ts/TestScriptGeneration";
import { TestScriptExecutionResult, TestScriptExecutionOptions } from "../ts/TestScriptExecution";

export interface TestScriptPlugin extends Plugin {

    /**
     * Generate source code from abstract test scripts, according to the given options.
     * 
     * @param abstractTestScripts Abstract test scripts.
     * @param options Generation options.
     * @return Generation results.
     */
    generateCode(
        abstractTestScripts: AbstractTestScript[],
        options: TestScriptGenerationOptions
    ): TestScriptGenerationResult;

    /**
     * Execute test scripts, according to the given options.
     * 
     * @param options Execution options.
     * @return Execution results.
     */    
    executeCode( options: TestScriptExecutionOptions ): TestScriptExecutionResult;

    /**
     * Converts a file produced by the execution of test scripts (e.g. a JSON or a XML file).
     * 
     * @param filePath Input file.
     * @return Execution results.
     */     
    convertReportFile( filePath: string ): TestScriptExecutionResult;    

}