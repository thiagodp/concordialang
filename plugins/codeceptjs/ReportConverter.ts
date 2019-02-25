import { TestMethodResult, TestScriptExecutionResult, TestSuiteResult, TotalExecutionResult } from '../../modules/testscript/TestScriptExecution';
import { DefaultInstrumentationReader } from '../../modules/plugin/InstrumentationReader';
import { Location } from '../../modules/ast/Location';
import * as fs from 'fs';
import { promisify } from 'util';
import { FileInstrumentationReader } from '../../modules/plugin/FileInstrumentationReader';

/**
 * Converts a Mocha Multi Report to Concordia's format.
 *
 * @see https://github.com/stanleyhlng/mocha-multi-reporters
 */
export class ReportConverter {

    private readonly _instrumentator: FileInstrumentationReader;

    constructor( private _fs: any = fs, private _encoding = 'utf-8' ) {
        this._instrumentator = new FileInstrumentationReader(
            new DefaultInstrumentationReader(), _fs, _encoding );
    }

    /**
     * Reads a execution result file and converts it to the expected Concordia's format.
     *
     * @param resultFilePath Path to a file with the test results of CodeceptJS.
     * @param pluginConfigFilePath Path to the plugin configuration file.
     */
    public async convertFrom(
        resultFilePath: string,
        pluginConfigFilePath: string
    ): Promise< TestScriptExecutionResult > {

        const source: any = await this.readJsonFile( resultFilePath );

        let pluginConfig = {};
        try {
            pluginConfig = await this.readJsonFile( pluginConfigFilePath );
        } catch ( e ) {
            // will stay with empty plug-in info
        }

        let result: TestScriptExecutionResult = new TestScriptExecutionResult();

        source.resultFilePath = resultFilePath;
        this.fillMetadata( source, result );
        this.fillStatus( source, result );
        await this.fillResults( source, result );
        this.fillPluginInfo( pluginConfig, result );

        return result;
    }

    /**
     * Fills the basic metadata
     *
     * @param source Object read from the original report.
     * @param result Concordia format.
     */
    private fillMetadata( source: any, result: TestScriptExecutionResult ): void {
        result.sourceFile = source.resultFilePath;
    }

    /**
     * Fills the status
     *
     * @param source Object read from the original report.
     * @param result Concordia format.
     */
    private fillStatus( source: any, result: TestScriptExecutionResult ): void {
        const stats = source.stats;
        if ( ! stats ) {
            result.started = 'Unknown';
            result.finished = ( new Date() ).toUTCString();

            // Get the needed details from `tests`
            if ( ! source.tests ) {
                return;
            }
            const tests = source.tests;

            // Duration
            let totalDuration = 0;
            for ( let t of tests ) {
                totalDuration += t.duration;
            }
            result.durationMs = totalDuration;

            // Total tests
            if ( ! result.total ) {
                result.total = new TotalExecutionResult();
            }
            result.total.tests = tests.length;
            result.total.passed = ( source.passes || [] ).length;
            result.total.failed = ( source.failures || [] ).length;

            return;
        }

        result.started = stats.start;
        result.finished = stats.end;
        result.durationMs = stats.duration;

        // Because of a bug in CodeceptJS JSON's counting
        let failed = stats.failures;
        if ( failed === stats.tests && stats.passes > 0 ) {
            failed -= stats.passes;
        }

        result.total = {
            tests: stats.tests,
            passed: stats.passes,
            failed: failed,
            skipped: 0,
            error: 0,
            unknown: 0
        };
    }

    /**
     * Fills plugin's info.
     *
     * @param source Object read from the original report.
     * @param result Concordia format.
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
     * @param source Object read from the original report.
     * @param result Concordia format.
     */
    private async fillResults( source: any, result: TestScriptExecutionResult ): Promise< void > {

        if ( ! result.results ) {
            result.results = [];
        }

        // Creates a TestMethodResult for each CodeceptJS' test method report.
        for ( let method of source.tests || [] ) {

            let testMethodResult: TestMethodResult = new TestMethodResult();
            testMethodResult.name = method.title;
            testMethodResult.status = this.isObjectEmpty( method.err ) ? 'passed' : 'failed';
            testMethodResult.durationMs = method.duration;

            if ( 'failed' === testMethodResult.status ) {

                const scriptLocation: Location = this.extractScriptLocationFromStackTrace( method.err.stack );

                let specLocation: Location;
                if ( !! scriptLocation ) {
                    specLocation = await this.extractSpecLocationFromScriptLocation( scriptLocation );
                }

                testMethodResult.exception = {
                    type: ! method.err.params ? undefined : method.err.params.type,
                    message: method.err.message,
                    stackTrace: method.err.stack,

                    scriptLocation: scriptLocation,
                    specLocation: specLocation
                };
            }

            // Pushes a TestMethodResult to its correspondent TestSuiteResult.
            const suiteName: string = method.fullTitle.indexOf( ':' ) >= 0
                ? method.fullTitle.split( ':' )[0] //fullTitle format is 'feature: test'
                : method.fullTitle;

            this.pushTestMethodResult( result, testMethodResult, suiteName );
        }
    }

    /**
     * Pushes a Test Method Result to a Test Script Execution Result.
     *
     * @param result Concordia format.
     * @param testMethodResult TestMethodResult to be pushed.
     * @param suiteName Test Suite Result name.
     */
    private pushTestMethodResult(
        result: TestScriptExecutionResult,
        testMethodResult: TestMethodResult,
        suiteName: string
    ): void {

        // Finds the correspondent test suite.
        let testSuiteResult: TestSuiteResult =
            result.results.find( ( suite: TestSuiteResult ) => suite.suite === suiteName );

        // If the test suite doesn't exists, creates a new one.
        if ( ! testSuiteResult ) {
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
     * Extract script location from a stack trace.
     *
     * @param stackTrace Stack trace.
     */
    public extractScriptLocationFromStackTrace( stackTrace: string ): Location | null {

        // Extract file name and line, e.g., 'path/to/file.js:15:7'
        const regex = /(?:\()([^(]+.js)\:(\d+)\:(\d+)(?:\))/gm;
        const r = regex.exec( stackTrace );
        if ( ! r || ! r[ 1 ] ) {
            return null;
        }
        const [ , path, lin, col ] = r;

        return {
            filePath: path,
            line: parseInt( lin ),
            column: parseInt( col )
        };
    }

    /**
     * Extract specification location from a script file.
     *
     * @param scriptFile Script file.
     */
    private async extractSpecLocationFromScriptLocation( scriptLoc: Location ): Promise< Location > {
        return await this._instrumentator.retrieveSpecLocation( scriptLoc );
    }

    private async readJsonFile( path: string ): Promise< any > {
        const readFileAsync = promisify( this._fs.readFile );
        const content = await readFileAsync( path, this._encoding );
        return JSON.parse( content.toString() );
    }

}
