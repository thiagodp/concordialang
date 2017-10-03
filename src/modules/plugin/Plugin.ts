import { TestScriptGenerationOptions, TestScriptExecutionOptions } from "../ts/TestScriptGeneration";

/**
 * Defines how to interact with a plugin.
 * 
 * @author Thiago Delgado Pinto
 */
export interface Plugin {

    /** Returns true if the plugin is fake (i.e. only for demonstration purposes). */
    isFake(): boolean;

    /** Returns the plugin name. */
    name(): string;

    /** Returns the plugin version. */
    version(): string;

    /** Returns target frameworks. */
    frameworks(): string[];

    /**
     * Generate test scripts from test cases, according to the given options.
     * 
     * @param genOptions Generation options.
     * @param testCases  Source test cases.
     * @return Generation results.
     */
    generateTestScripts( genOptions: TestScriptGenerationOptions, testCases: any[] ): TSGenerationResult;

    /**
     * Execute test scripts, according to the given options.
     * 
     * @param execOptions Execution options.
     * @return Execution results.
     */    
    executeTestScripts( execOptions: TestScriptExecutionOptions ): TSExecutionResult;

    /**
     * Converts a file produced by the execution of test scripts (e.g. a JSON or a XML file).
     * 
     * @param filePath Input file.
     * @return Execution results.
     */     
    convertExecutionReportFile( filePath: string ): TSExecutionResult;

}
