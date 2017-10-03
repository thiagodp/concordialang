// WARNING: WIP !!!

import { SpecFilter } from "../tc/SpecFilter";

/**
 * Test script execution options.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestScriptExecutionOptions {
    public filter: TestScriptExecutionFilter = new TestScriptExecutionFilter();
    public resultDir: string = null; // directory where to place the files with test results
}

/**
 * Test script execution filter.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestScriptExecutionFilter extends SpecFilter {
}

/**
 * Test script execution result.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestScriptExecutionResult {
}