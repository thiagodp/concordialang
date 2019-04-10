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
const fs = require("fs");
const util_1 = require("util");
const concordialang_types_1 = require("concordialang-types");
const concordialang_plugin_1 = require("concordialang-plugin");
/**
 * Converts a Mocha Multi Report to Concordia's format.
 *
 * @see https://github.com/stanleyhlng/mocha-multi-reporters
 */
class ReportConverter {
    constructor(_fs = fs, _encoding = 'utf-8') {
        this._fs = _fs;
        this._encoding = _encoding;
        this._instrumentator = new concordialang_plugin_1.FileInstrumentationReader(new concordialang_plugin_1.DefaultInstrumentationReader(), _fs, _encoding);
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
            let pluginConfig = {};
            try {
                pluginConfig = yield this.readJsonFile(pluginConfigFilePath);
            }
            catch (e) {
                // will stay with empty plug-in info
            }
            let result = new concordialang_types_1.TestScriptExecutionResult();
            source.resultFilePath = resultFilePath;
            this.fillMetadata(source, result);
            this.fillStatus(source, result);
            yield this.fillResults(source, result);
            this.fillPluginInfo(pluginConfig, result);
            return result;
        });
    }
    /**
     * Fills the basic metadata
     *
     * @param source Object read from the original report.
     * @param result Concordia format.
     */
    fillMetadata(source, result) {
        result.sourceFile = source.resultFilePath;
    }
    /**
     * Fills the status
     *
     * @param source Object read from the original report.
     * @param result Concordia format.
     */
    fillStatus(source, result) {
        const stats = source.stats;
        if (!stats) {
            result.started = 'Unknown';
            result.finished = (new Date()).toUTCString();
            // Get the needed details from `tests`
            if (!source.tests) {
                return;
            }
            const tests = source.tests;
            // Duration
            let totalDuration = 0;
            for (let t of tests) {
                totalDuration += t.duration;
            }
            result.durationMs = totalDuration;
            // Total tests
            if (!result.total) {
                result.total = new concordialang_types_1.TotalExecutionResult();
            }
            result.total.tests = tests.length;
            result.total.passed = (source.passes || []).length;
            result.total.failed = (source.failures || []).length;
            return;
        }
        result.started = stats.start;
        result.finished = stats.end;
        result.durationMs = stats.duration;
        // Because of a bug in CodeceptJS JSON's counting
        let failed = stats.failures;
        if (failed === stats.tests && stats.passes > 0) {
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
     * @param source Object read from the original report.
     * @param result Concordia format.
     */
    fillResults(source, result) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!result.results) {
                result.results = [];
            }
            // Creates a TestMethodResult for each CodeceptJS' test method report.
            for (let method of source.tests || []) {
                let testMethodResult = new concordialang_types_1.TestMethodResult();
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
                const suiteName = method.fullTitle.indexOf(':') >= 0
                    ? method.fullTitle.split(':')[0] //fullTitle format is 'feature: test'
                    : method.fullTitle;
                this.pushTestMethodResult(result, testMethodResult, suiteName);
            }
        });
    }
    /**
     * Pushes a Test Method Result to a Test Script Execution Result.
     *
     * @param result Concordia format.
     * @param testMethodResult TestMethodResult to be pushed.
     * @param suiteName Test Suite Result name.
     */
    pushTestMethodResult(result, testMethodResult, suiteName) {
        // Finds the correspondent test suite.
        let testSuiteResult = result.results.find((suite) => suite.suite === suiteName);
        // If the test suite doesn't exists, creates a new one.
        if (!testSuiteResult) {
            testSuiteResult = new concordialang_types_1.TestSuiteResult();
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
        const regex = /(?:\()([^(]+.js)\:(\d+)\:(\d+)(?:\))/gm;
        const r = regex.exec(stackTrace);
        if (!r || !r[1]) {
            return null;
        }
        const [, path, lin, col] = r;
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
