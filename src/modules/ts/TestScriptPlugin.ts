import { AbstractTestScript } from './AbstractTestScript';
import { TestScriptGenerationOptions } from "./TestScriptGeneration";
import { TestScriptExecutionResult, TestScriptExecutionOptions } from "./TestScriptExecution";

/**
 * Test script plugin.
 * 
 * @author Thiago Delgado Pinto
 */
export interface TestScriptPlugin {


    /** Returns true if the plugin is fake (i.e. for demonstration purposes). */
    isFake(): boolean;

    /** Returns the plugin name. */
    name(): string;

    /** Returns the plugin description. */
    description(): string;

    /** Returns the plugin version. */
    version(): string;

    /** Returns the target technologies (e.g. frameworks). */
    targets(): string[];

    /** Returns the authors of the plugin. */
    authors(): string[];

    
    /**
     * Generate source code from abstract test scripts, according to the given options.
     * 
     * @param abstractTestScripts Abstract test scripts
     * @param options Options
     * @return An array with promises for each file, contaning the file name as the data.
     */
    generateCode(
        abstractTestScripts: AbstractTestScript[],
        options: TestScriptGenerationOptions
    ): Promise< string >[];

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