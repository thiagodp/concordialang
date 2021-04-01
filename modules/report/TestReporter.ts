import { TestScriptExecutionResult } from "concordialang-types";

/**
 * Test reporter options
 */
export interface TestReporterOptions {}

/**
 * Test script execution reporter
 *
 * @author Thiago Delgado Pinto
 */
export interface TestReporter< Opt extends TestReporterOptions > {

    /**
     * Reports a single test script execution result.
     *
     * @param result Result to report.
     * @param options Reporting options.
     * @returns Promise< void >
     */
    report(
        result: TestScriptExecutionResult,
        options?: Opt
    ): Promise< void >;

}