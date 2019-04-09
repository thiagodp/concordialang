import { join, normalize } from 'path';
import { vol, fs as memfs } from 'memfs';
import { TestScriptExecutionResult, TestSuiteResult, TestMethodResult } from 'concordialang-types/testscript';
import { ReportConverter } from '../../../plugins/codeceptjs/ReportConverter';

/**
 * @author Matheus Eller Fagundes
 * @author Thiago Delgado Pinto
 */
describe( 'ReportConverterTest', () => {

    // helper variables

    // const dir = resolve( __dirname );
    const dir = normalize( process.cwd() );
    const reportFilePath = join( dir, 'report.json' );
    const pluginConfigPath = join( dir, 'codeceptJS.json' );

    const scriptFilePath = join( dir, 'test.js' );
    const scriptFileLine = 5;
    const scriptFileColumn = 7;

    const stackTrace = `expected web page to include "vai falhar"

        Scenario Steps:

        - I.see( "vai falhar" ) at Test.Scenario (${scriptFilePath}:${scriptFileLine}:${scriptFileColumn})
        - I.amOnPage( "/" ) at Test.Scenario (${scriptFilePath}:${scriptFileLine}:${scriptFileColumn - 1})`;

    const specFilePath = 'path/to/login.feature';
    const specFileLine = 50;
    const specKeyword = 'source';

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

    const scriptFileLines: string[] = [
        `// ${specKeyword}: ${specFilePath}`,
        '',
        'describe( "foo", () => {',
        '   it( "bar", () => {',
        `       fake(); // (${specFileLine},1)`, // << this is the line number 5 in the script file
        '   } );',
        '} );'
    ];

    let createFiles = () => {

        // Synchronize the current path (IMPORTANT!)
        vol.mkdirpSync( dir, { recursive: true } ); // mkdirpSync, not mkdirSync !

        memfs.writeFileSync( reportFilePath, JSON.stringify( report ) );
        memfs.writeFileSync( pluginConfigPath, JSON.stringify( pluginConfig ) );
        memfs.writeFileSync( scriptFilePath, scriptFileLines.join( "\n" ) );
    };

    let eraseFiles = () => {
        vol.reset(); // erase in-memory files
    };

    beforeEach( createFiles );
    afterEach( eraseFiles );


    it( 'succefully converts a CodeceptJS report', async () => {

        let converter: ReportConverter = new ReportConverter( memfs ); // under test

        let received: TestScriptExecutionResult =
            await converter.convertFrom( reportFilePath, pluginConfigPath );

        let expectedMethod1:TestMethodResult = new TestMethodResult();
        expectedMethod1.durationMs = 1723;
        expectedMethod1.name = 'successful login';
        expectedMethod1.status = 'passed';

        let expectedMethod2:TestMethodResult = new TestMethodResult();
        expectedMethod2.durationMs = 1655;
        expectedMethod2.name = 'unsuccessful login';
        expectedMethod2.status = 'failed';
        expectedMethod2.exception = {
            message: 'expected web page to include "vai falhar"',
            stackTrace: stackTrace,
            type: 'to include',

            scriptLocation: {
                filePath: scriptFilePath,
                line: scriptFileLine, // << important to retrieve spec line from the script file
                column: scriptFileColumn
            },

            specLocation: {
                filePath: specFilePath,
                line: specFileLine,
                column: 1
            }
        };

        let expectedSuite: TestSuiteResult = new TestSuiteResult();
        expectedSuite.suite = 'login';
        expectedSuite.methods = [ expectedMethod1, expectedMethod2 ];

        let expected: TestScriptExecutionResult = new TestScriptExecutionResult();
        expected.sourceFile = reportFilePath;
        expected.started = '2017-11-06T00:20:32.304Z';
        expected.finished = '2017-11-06T00:20:38.977Z';
        expected.durationMs = 6673;
        expected.total= {
            tests:  2,
            passed: 1,
            failed: 1,
            skipped: 0,
            error: 0,
            unknown: 0
        };
        expected.plugin = {
            description: 'Generates test scripts for CodeceptJS',
            name: 'codeceptjs',
            targets: [ "CodeceptJS" ],
            version: '0.1'
        };
        expected.results = [ expectedSuite ];

        expect( received ).toEqual( expected );
    } );

} );
