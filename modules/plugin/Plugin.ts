import { AbstractTestScript } from '../testscript/AbstractTestScript';
import { TestScriptGenerationOptions } from "../testscript/TestScriptOptions";
import { TestScriptExecutionResult, TestScriptExecutionOptions } from "../testscript/TestScriptExecution";

/**
 * Test script plugin.
 *
 * @author Thiago Delgado Pinto
 */
export interface Plugin {

    /**
     * Generate source code from abstract test scripts, according to the given options.
     *
     * @param abstractTestScripts Abstract test scripts
     * @param options Options
     * @param errors File generation errors
     * @return An array with promises for each file, contaning the file name as the data.
     */
    generateCode(
        abstractTestScripts: AbstractTestScript[],
        options: TestScriptGenerationOptions,
        errors: Error[]
    ): Promise< string[] >;

    /**
     * Execute test scripts, according to the given options.
     *
     * @param options Execution options.
     * @return Execution results.
     */
    executeCode( options: TestScriptExecutionOptions ): Promise< TestScriptExecutionResult >;

    /**
     * Converts a file produced by the execution of test scripts (e.g. a JSON or a XML file).
     *
     * @param filePath Input file.
     * @return Execution results.
     */
    convertReportFile( filePath: string ): Promise< TestScriptExecutionResult >;

    /**
     * Returns the default report file name. Concordia may look for it in the
     * output/result directory when the parameter `--just-report` is given.
     */
    defaultReportFile(): Promise< string >;

}
