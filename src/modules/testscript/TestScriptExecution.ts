import { SpecFilter } from "../testcase/SpecFilter";

/**
 * Test script execution options.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestScriptExecutionOptions {
    public filter: TestScriptExecutionFilter = new TestScriptExecutionFilter();
    public sourceCodeDir: string = null; // where the script files are
    public executionResultDir: string = null; // where to place the file with the execution results
}

/**
 * Test script execution filter.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestScriptExecutionFilter extends SpecFilter {
}

/**
 * External tool execution result.
 * 
 * @author Thiago Delgado Pinto
 */
export class ExternalToolExecutionResult {

    success: boolean;
    details: string; // mainly in case of success is false

    // Undefined if success is false
    scriptExecutionResult: TestScriptExecutionResult | undefined;
}

/**
 * Test script execution result.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestScriptExecutionResult {

    schemaVersion: string;

    sourceFile: string; // e.g.: xunit.xml
    
    plugin: {
        name: string;
        description: string;
        version: string;
        targets: string[];
    };

    started: string; // UTC timestamp
    finished: string; // UTC timestamp    
    durationMs: number; // milliseconds

    total: {
        tests: number;
        passed: number;
        skipped: number;
        failed: number;
        error: number;
        unknown: number;
    };
    results: TestSuiteResult[];
}

/**
 * Test suite result.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestSuiteResult {
    suite: string;
    methods: TestMethodResult[];
}

/**
 * Test script method result.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestMethodResult {

    name: string;
    
    status: 'passed' | 'failed' | 'skipped' | 'error' | 'unknown';

    durationMs: number; // milliseconds

    isForSetup: boolean | undefined; // e.g. setUp/setUpOnce/before/beforeAll

    exception: {
        type: string;
        message: string;
        file: string;
        line: number;
        stackTrace: string;
    } | undefined;

}