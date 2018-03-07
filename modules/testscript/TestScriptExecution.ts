import { Location } from "../ast/Location";

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
export class TestScriptExecutionFilter {

    public minFeatureImportance: number = 1;  // 1..9
    public maxFeatureImportance: number = 9;  // 1..9

    public minScenarioImportance: number = 1;  // 1..9
    public maxScenarioImportance: number = 9;  // 1..9

    public featureName: string = null; // null == don't filter
    public scenarioName: string = null; // null == don't filter    
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

    schemaVersion: string; // Follows semantic versioning (semver.org)

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

    total: TotalExecutionResult = new TotalExecutionResult();
    
    results: TestSuiteResult[];
}

/**
 * Total execution result
 * 
 * @author Thiago Delgado Pinto
 */
export class TotalExecutionResult {
    tests: number = 0;
    passed: number = 0;
    skipped: number = 0;
    failed: number = 0;
    error: number = 0;
    unknown: number = 0;    
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

    isForSetup?: boolean; // e.g., setUp/setUpOnce/before/beforeAll

    exception?: TestMethodException;

}

/**
 * Test method exception.
 * 
 * @author Thiago Delgado Pinto
 */
export class TestMethodException {
    type: string;
    message: string;
    stackTrace: string;
    scriptLocation: Location;
    specLocation?: Location;
}