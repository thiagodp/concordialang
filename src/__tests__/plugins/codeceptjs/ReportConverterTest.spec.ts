import { ReportConverter } from '../../../plugins/codeceptjs/ReportConverter';
import { TestScriptExecutionResult, TestSuiteResult, TestMethodResult } from '../../../modules/testscript/TestScriptExecution';
import { fs as memfs, vol } from 'memfs';

/**
* @author Matheus Eller Fagundes
*/
describe( 'ReportConverterTest', () => {

    const report: any = {
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
                    "stack": "expected web page to include \"vai falhar\"\n\nScenario Steps:\n\n- I.see(\"vai falhar\") at Test.Scenario (tests/test.js:15:7)\n- I.amOnPage(\"/\") at Test.Scenario (tests/test.js:14:7)\n\n"
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
                    "stack": "expected web page to include \"vai falhar\"\n\nScenario Steps:\n\n- I.see(\"vai falhar\") at Test.Scenario (tests/test.js:15:7)\n- I.amOnPage(\"/\") at Test.Scenario (tests/test.js:14:7)\n\n"
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

    const pluginConfig: any = {
        "isFake": false,
        "packageName": "concordialang-codeceptjs",
        "name": "codeceptjs",
        "description": "Generates test scripts for CodeceptJS",
        "version": "0.1",
        "targets": [ "CodeceptJS" ],
        "authors": [
            "Matheus Eller Fagundes (matheusefagundes@gmail.com)",
            "Thiago Delgado Pinto (thiago-dp@bol.com.br)"
        ],
        "file": "codeceptjs/CodeceptJS.ts",
        "class": "CodeceptJS"
    };

    // under test
    let converter: ReportConverter = new ReportConverter( memfs );

    beforeEach( () => {
        vol.reset(); // erase in-memory files
    } );

    it( 'succefully converts a CodeceptJS report', () => {
        let reportFilePath = '/report.json';
        let pluginConfigPath = '/codeceptJS.json';
        memfs.writeFileSync( reportFilePath, JSON.stringify( report ) );
        memfs.writeFileSync( pluginConfigPath, JSON.stringify( pluginConfig ) );

        let received: TestScriptExecutionResult = converter.convertFrom( reportFilePath, pluginConfigPath );

        let expectedMethod1:TestMethodResult = new TestMethodResult();
        expectedMethod1.durationMs = 1723;
        expectedMethod1.name = 'successful login';
        expectedMethod1.status = 'passed';

        let expectedMethod2:TestMethodResult = new TestMethodResult();
        expectedMethod2.durationMs = 1655;
        expectedMethod2.name = 'unsuccessful login';
        expectedMethod2.status = 'failed';
        expectedMethod2.exception = {
            file: 'tests/test.js',
            line: 15,
            message: 'expected web page to include "vai falhar"',
            stackTrace: "expected web page to include \"vai falhar\"\n\nScenario Steps:\n\n- I.see(\"vai falhar\") at Test.Scenario (tests/test.js:15:7)\n- I.amOnPage(\"/\") at Test.Scenario (tests/test.js:14:7)\n\n",
            type: 'to include'
        };

        let expectedSuite: TestSuiteResult = new TestSuiteResult();
        expectedSuite.suite = 'login';
        expectedSuite.methods = [expectedMethod1, expectedMethod2];

        let expected: TestScriptExecutionResult = new TestScriptExecutionResult();
        expected.sourceFile = reportFilePath;
        expected.started = '2017-11-06T00:20:32.304Z';
        expected.finished = '2017-11-06T00:20:38.977Z';
        expected.durationMs = 6673;
        expected.total= {
            tests:  2,
            passed: 1,
            failed: 1,
            skipped: null,
            error: null,
            unknown: null
        };
        expected.plugin = {
            description: 'Generates test scripts for CodeceptJS',
            name: 'codeceptjs',
            targets: [ "CodeceptJS" ],
            version: '0.1'
        };
        expected.results = [expectedSuite];

        expect( received ).toEqual( expected );
    } );

} );
