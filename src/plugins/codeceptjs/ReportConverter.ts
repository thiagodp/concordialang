import { TestMethodResult, TestScriptExecutionResult, TestSuiteResult } from '../../modules/testscript/TestScriptExecution';
import * as fs from 'fs';

/**
 * Converts a CodeceptJS execution result to Concordia's format.
 *
 * @author Matheus Fagundes
 */
export class ReportConverter {

    constructor( private _fs?: any ) {
        _fs = _fs || fs; // assumes the Node's fs as the default
    }

    /**
     * Converts a test execution result from a file.
     *
     * @param resultFilePath Path to file with CodeceptJS test results.
     */
    public convertFrom( resultFilePath: string, pluginConfigFilePath: string ): TestScriptExecutionResult {
        const source: any = JSON.parse( this._fs.readFileSync( resultFilePath ).toString() );
        const pluginConfig = JSON.parse( this._fs.readFileSync( pluginConfigFilePath ).toString() );
        let result: TestScriptExecutionResult = new TestScriptExecutionResult();
        source.resultFilePath = resultFilePath;

        this.fillMetadata( source, result );
        this.fillStatus( source, result );
        this.fillResults( source, result );
        this.fillPluginInfo( pluginConfig, result );

        return result;
    }

    /**
     * Fills test result metadata.
     *
     * @param source The CodeceptJS' result in JSON format.
     * @param result The Concordia's result to fill.
     */
    private fillMetadata( source: any, result: TestScriptExecutionResult ): void {
        result.sourceFile = source.resultFilePath;
    }

    /**
     * Fills test result status.
     *
     * @param source The CodeceptJS' result in JSON format.
     * @param result The Concordia's result to fill.
     */
    private fillStatus( source: any, result: TestScriptExecutionResult ): void {
        result.started = source.stats.start;
        result.finished = source.stats.end;
        result.durationMs = source.stats.duration;
        result.total = {
            tests: source.stats.tests,
            passed: source.stats.passes,
            failed: source.stats.failures,
            skipped: null,
            error: null,
            unknown: null
        };
    }

    /**
     * Fills plugin's info.
     *
     * @param source The CodeceptJS plugin configuration.
     * @param result The Concordia's result to fill.
     */
    private fillPluginInfo( pluginConfig: any, result: TestScriptExecutionResult ): void {
        result.plugin = {
            description: pluginConfig.description,
            name: pluginConfig.name,
            targets: pluginConfig.targets,
            version: pluginConfig.version
        };
    }

    /**
     * Fills execution results.
     *
     * @param source The CodeceptJS' result in JSON format.
     * @param result The Concordia's result to fill.
     */
    private fillResults( source: any, result: TestScriptExecutionResult ): void {
        if( !result.results ) {
            result.results = [];
        }

        // Creates a TestMethodResult for each CodeceptJS' test method report.
        source.tests.forEach( method => {
            let testMethodResult: TestMethodResult = new TestMethodResult();
            testMethodResult.name = method.title;
            testMethodResult.status = this.isObjectEmpty( method.err ) ? 'passed' : 'failed';
            testMethodResult.durationMs = method.duration;

            if( testMethodResult.status == 'failed' ){
                let stackInfo = this.extractStackInfo( method.err.stack );
                testMethodResult.exception = {
                    type: method.err.params.type,
                    message: method.err.message,
                    file: stackInfo.file,
                    line: stackInfo.line,
                    stackTrace: method.err.stack
                };
            }

            // Pushes the TestMethodResult to it correspondent TestSuiteResult.
            let suiteName: string = method.fullTitle.split( ':' )[0]; //fullTitle format is 'feature: test'
            this.pushTestMethodResult( result, testMethodResult, suiteName );
        });
    }

    /**
     * Pushes a Test Method Result to a Test Script Execution Result.
     * @param result The Concordia's result to fill.
     * @param testMethodResult TestMethodResult to be pushed.
     * @param suiteName Test Suite Result name.
     */
    private pushTestMethodResult( result: TestScriptExecutionResult, testMethodResult: TestMethodResult, suiteName: string ): void {
        // Finds the correspondent test suite.
        let testSuiteResult: TestSuiteResult = result.results.filter(( suite: TestSuiteResult ) => {
            return suite.suite === suiteName;
        })[0];

        // If the test suite doesn't exists, creates a new one.
        if( !testSuiteResult ){
            testSuiteResult = new TestSuiteResult();
            testSuiteResult.suite = suiteName;
            testSuiteResult.methods = [];
            result.results.push( testSuiteResult );
        }

        // Finally, pushes the method result to the correct suite.
        testSuiteResult.methods.push( testMethodResult );
    }

    /**
     * Verifies if a object is empty.
     * @param obj Object to be verified.
     */
    private isObjectEmpty( obj: object ): boolean {
        return Object.keys( obj ).length === 0 && obj.constructor === Object;
    }

    /**
     * Extract file name and line number of a stack trace.
     * @param stack The string representation of stack trace.
     */
    private extractStackInfo( stack: string ): { file: string, line: number } {
        // Extract file name and line (e.g. 'path/to/file.js:15:7').
        let fileAndLine: string = stack.match(/(\w|\/|\\)+\.js:\d+:\d+/)[0];
        let info = fileAndLine.split( ':' );
        return {
            file: info[0],
            line: parseInt( info[1] )
        };
    }

}
