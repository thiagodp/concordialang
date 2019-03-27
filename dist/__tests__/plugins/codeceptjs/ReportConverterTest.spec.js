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
const ReportConverter_1 = require("../../../plugins/codeceptjs/ReportConverter");
const TestScriptExecution_1 = require("../../../modules/testscript/TestScriptExecution");
const path_1 = require("path");
const memfs_1 = require("memfs");
/**
 * @author Matheus Eller Fagundes
 * @author Thiago Delgado Pinto
 */
describe('ReportConverterTest', () => {
    // helper variables
    // const dir = resolve( __dirname );
    const dir = path_1.normalize(process.cwd());
    const reportFilePath = path_1.join(dir, 'report.json');
    const pluginConfigPath = path_1.join(dir, 'codeceptJS.json');
    const scriptFilePath = path_1.join(dir, 'test.js');
    const scriptFileLine = 5;
    const scriptFileColumn = 7;
    const stackTrace = `expected web page to include "vai falhar"

        Scenario Steps:

        - I.see( "vai falhar" ) at Test.Scenario (${scriptFilePath}:${scriptFileLine}:${scriptFileColumn})
        - I.amOnPage( "/" ) at Test.Scenario (${scriptFilePath}:${scriptFileLine}:${scriptFileColumn - 1})`;
    const specFilePath = 'path/to/login.feature';
    const specFileLine = 50;
    const specKeyword = 'source';
    const report = {
        "stats": {
            "suites": 1,
            "tests": 2,
            "passes": 1,
            "pending": 0,
            "failures": 1,
            "start": "2017-11-06T00:20:32.304Z",
            "end": "2017-11-06T00:20:38.977Z",
            "duration": 6673
        },
        "tests": [
            {
                "title": "successful login",
                "fullTitle": "login: successful login",
                "duration": 1723,
                "currentRetry": 0,
                "err": {}
            },
            {
                "title": "unsuccessful login",
                "fullTitle": "login: unsuccessful login",
                "duration": 1655,
                "currentRetry": 0,
                "err": {
                    "params": {
                        "jar": "web page",
                        "customMessage": "",
                        "type": "to include",
                        "needle": "vai falhar",
                        "haystack": "Login\nEntrar"
                    },
                    "template": "{{customMessage}}expected {{jar}} {{type}} \"{{needle}}\"",
                    "showDiff": true,
                    "actual": "Login\nEntrar",
                    "expected": "vai falhar",
                    "message": "expected web page to include \"vai falhar\"",
                    "stack": stackTrace
                }
            }
        ],
        "pending": [],
        "failures": [
            {
                "title": "unsuccessful login",
                "fullTitle": "login: unsuccessful login",
                "duration": 1655,
                "currentRetry": 0,
                "err": {
                    "params": {
                        "jar": "web page",
                        "customMessage": "",
                        "type": "to include",
                        "needle": "vai falhar",
                        "haystack": "Login\nEntrar"
                    },
                    "template": "{{customMessage}}expected {{jar}} {{type}} \"{{needle}}\"",
                    "showDiff": true,
                    "actual": "Login\nEntrar",
                    "expected": "vai falhar",
                    "message": "expected web page to include \"vai falhar\"",
                    "stack": stackTrace
                }
            }
        ],
        "passes": [
            {
                "title": "successful login",
                "fullTitle": "login: successful login",
                "duration": 1723,
                "currentRetry": 0,
                "err": {}
            }
        ]
    };
    const pluginConfig = {
        "isFake": false,
        "packageName": "concordialang-codeceptjs",
        "name": "codeceptjs",
        "description": "Generates test scripts for CodeceptJS",
        "version": "0.1",
        "targets": ["CodeceptJS"],
        "authors": [
            "Matheus Eller Fagundes (matheusefagundes@gmail.com)",
            "Thiago Delgado Pinto (thiago-dp@bol.com.br)"
        ],
        "file": "codeceptjs/CodeceptJS.ts",
        "class": "CodeceptJS"
    };
    const scriptFileLines = [
        `// ${specKeyword}: ${specFilePath}`,
        '',
        'describe( "foo", () => {',
        '   it( "bar", () => {',
        `       fake(); // (${specFileLine},1)`,
        '   } );',
        '} );'
    ];
    let createFiles = () => {
        // Synchronize the current path (IMPORTANT!)
        memfs_1.vol.mkdirpSync(dir, { recursive: true }); // mkdirpSync, not mkdirSync !
        memfs_1.fs.writeFileSync(reportFilePath, JSON.stringify(report));
        memfs_1.fs.writeFileSync(pluginConfigPath, JSON.stringify(pluginConfig));
        memfs_1.fs.writeFileSync(scriptFilePath, scriptFileLines.join("\n"));
    };
    let eraseFiles = () => {
        memfs_1.vol.reset(); // erase in-memory files
    };
    beforeEach(createFiles);
    afterEach(eraseFiles);
    it('succefully converts a CodeceptJS report', () => __awaiter(this, void 0, void 0, function* () {
        let converter = new ReportConverter_1.ReportConverter(memfs_1.fs); // under test
        let received = yield converter.convertFrom(reportFilePath, pluginConfigPath);
        let expectedMethod1 = new TestScriptExecution_1.TestMethodResult();
        expectedMethod1.durationMs = 1723;
        expectedMethod1.name = 'successful login';
        expectedMethod1.status = 'passed';
        let expectedMethod2 = new TestScriptExecution_1.TestMethodResult();
        expectedMethod2.durationMs = 1655;
        expectedMethod2.name = 'unsuccessful login';
        expectedMethod2.status = 'failed';
        expectedMethod2.exception = {
            message: 'expected web page to include "vai falhar"',
            stackTrace: stackTrace,
            type: 'to include',
            scriptLocation: {
                filePath: scriptFilePath,
                line: scriptFileLine,
                column: scriptFileColumn
            },
            specLocation: {
                filePath: specFilePath,
                line: specFileLine,
                column: 1
            }
        };
        let expectedSuite = new TestScriptExecution_1.TestSuiteResult();
        expectedSuite.suite = 'login';
        expectedSuite.methods = [expectedMethod1, expectedMethod2];
        let expected = new TestScriptExecution_1.TestScriptExecutionResult();
        expected.sourceFile = reportFilePath;
        expected.started = '2017-11-06T00:20:32.304Z';
        expected.finished = '2017-11-06T00:20:38.977Z';
        expected.durationMs = 6673;
        expected.total = {
            tests: 2,
            passed: 1,
            failed: 1,
            skipped: 0,
            error: 0,
            unknown: 0
        };
        expected.plugin = {
            description: 'Generates test scripts for CodeceptJS',
            name: 'codeceptjs',
            targets: ["CodeceptJS"],
            version: '0.1'
        };
        expected.results = [expectedSuite];
        expect(received).toEqual(expected);
    }));
});
