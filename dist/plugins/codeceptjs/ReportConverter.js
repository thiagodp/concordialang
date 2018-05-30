"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const TestScriptExecution_1 = require("../../modules/testscript/TestScriptExecution");
const InstrumentationReader_1 = require("../../modules/plugin/InstrumentationReader");
const fs = require("fs");
const util_1 = require("util");
const FileInstrumentationReader_1 = require("../../modules/plugin/FileInstrumentationReader");
/**
 * Converts a CodeceptJS execution result to Concordia's format.
 */
class ReportConverter {
    constructor(_fs = fs, _encoding = 'utf-8') {
        this._fs = _fs;
        this._encoding = _encoding;
        this._instrumentator = new FileInstrumentationReader_1.FileInstrumentationReader(new InstrumentationReader_1.DefaultInstrumentationReader(), _fs, _encoding);
    }
    /**
     * Reads a execution result file and converts it to the expected Concordia's format.
     *
     * @param resultFilePath Path to a file with the test results of CodeceptJS.
     * @param pluginConfigFilePath Path to the plugin configuration file.
     */
    convertFrom(resultFilePath, pluginConfigFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const source = yield this.readJsonFile(resultFilePath);
            const pluginConfig = yield this.readJsonFile(pluginConfigFilePath);
            let result = new TestScriptExecution_1.TestScriptExecutionResult();
            source.resultFilePath = resultFilePath;
            this.fillMetadata(source, result);
            this.fillStatus(source, result);
            yield this.fillResults(source, result);
            this.fillPluginInfo(pluginConfig, result);
            return result;
        });
    }
    /**
     * Fills test result metadata.
     *
     * @param source The CodeceptJS' result in JSON format.
     * @param result The Concordia's result to fill.
     */
    fillMetadata(source, result) {
        result.sourceFile = source.resultFilePath;
    }
    /**
     * Fills test result status.
     *
     * @param source The CodeceptJS' result in JSON format.
     * @param result The Concordia's result to fill.
     */
    fillStatus(source, result) {
        result.started = source.stats.start;
        result.finished = source.stats.end;
        result.durationMs = source.stats.duration;
        result.total = {
            tests: source.stats.tests,
            passed: source.stats.passes,
            failed: source.stats.failures,
            skipped: 0,
            error: 0,
            unknown: 0
        };
    }
    /**
     * Fills plugin's info.
     *
     * @param source The CodeceptJS plugin configuration.
     * @param result The Concordia's result to fill.
     */
    fillPluginInfo(pluginConfig, result) {
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
    fillResults(source, result) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!result.results) {
                result.results = [];
            }
            // Creates a TestMethodResult for each CodeceptJS' test method report.
            for (let method of source.tests || []) {
                let testMethodResult = new TestScriptExecution_1.TestMethodResult();
                testMethodResult.name = method.title;
                testMethodResult.status = this.isObjectEmpty(method.err) ? 'passed' : 'failed';
                testMethodResult.durationMs = method.duration;
                if ('failed' === testMethodResult.status) {
                    const scriptLocation = this.extractScriptLocationFromStackTrace(method.err.stack);
                    let specLocation;
                    if (!!scriptLocation) {
                        specLocation = yield this.extractSpecLocationFromScriptLocation(scriptLocation);
                    }
                    testMethodResult.exception = {
                        type: !method.err.params ? undefined : method.err.params.type,
                        message: method.err.message,
                        stackTrace: method.err.stack,
                        scriptLocation: scriptLocation,
                        specLocation: specLocation
                    };
                }
                // Pushes a TestMethodResult to its correspondent TestSuiteResult.
                let suiteName = method.fullTitle.split(':')[0]; //fullTitle format is 'feature: test'
                this.pushTestMethodResult(result, testMethodResult, suiteName);
            }
        });
    }
    /**
     * Pushes a Test Method Result to a Test Script Execution Result.
     *
     * @param result The Concordia's result to fill.
     * @param testMethodResult TestMethodResult to be pushed.
     * @param suiteName Test Suite Result name.
     */
    pushTestMethodResult(result, testMethodResult, suiteName) {
        // Finds the correspondent test suite.
        let testSuiteResult = result.results.find((suite) => suite.suite === suiteName);
        // If the test suite doesn't exists, creates a new one.
        if (!testSuiteResult) {
            testSuiteResult = new TestScriptExecution_1.TestSuiteResult();
            testSuiteResult.suite = suiteName;
            testSuiteResult.methods = [];
            result.results.push(testSuiteResult);
        }
        // Finally, pushes the method result to the correct suite.
        testSuiteResult.methods.push(testMethodResult);
    }
    /**
     * Verifies if a object is empty.
     * @param obj Object to be verified.
     */
    isObjectEmpty(obj) {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    }
    /**
     * Extract script location from a stack trace.
     *
     * @param stackTrace Stack trace.
     */
    extractScriptLocationFromStackTrace(stackTrace) {
        // Extract file name and line, e.g., 'path/to/file.js:15:7'
        const regex = /((\w:| |\w|\/|\\|\.\/)+\.js):(\d+):(\d+)/umi;
        const r = regex.exec(stackTrace);
        if (!r || !r[1]) {
            return null;
        }
        const [_, path, __, lin, col] = r;
        return {
            filePath: path,
            line: parseInt(lin),
            column: parseInt(col)
        };
    }
    /**
     * Extract specification location from a script file.
     *
     * @param scriptFile Script file.
     */
    extractSpecLocationFromScriptLocation(scriptLoc) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._instrumentator.retrieveSpecLocation(scriptLoc);
        });
    }
    readJsonFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const readFileAsync = util_1.promisify(this._fs.readFile);
            const content = yield readFileAsync(path, this._encoding);
            return JSON.parse(content.toString());
        });
    }
}
exports.ReportConverter = ReportConverter;
