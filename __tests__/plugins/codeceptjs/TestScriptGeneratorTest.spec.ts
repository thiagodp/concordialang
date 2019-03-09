import { AbstractTestScript } from '../../../modules/testscript/AbstractTestScript';
import { TestScriptGenerator } from "../../../plugins/codeceptjs/TestScriptGenerator";
import { CommandMapper } from '../../../plugins/codeceptjs/CommandMapper';
import { CODECEPTJS_COMMANDS } from '../../../plugins/codeceptjs/Commands';

/**
 * @author Matheus Eller Fagundes
 * @author Thiago Delgado Pinto
 */
describe( 'TestScriptGeneratorTest', () => {

    let gen: TestScriptGenerator; // under test

    const LINES_TO_IGNORE = 5;

    function uglify(string: string): string{
        return string.replace(/(\r\n|\n|\r|[ \t])/gm, '');
    }

    function compare( testCase: AbstractTestScript, expected: string ) {
        const original = gen.generate( testCase );
        const lines = original.split( "\n" ).splice( LINES_TO_IGNORE - 1 );
        const adjusted = lines.join( "\n" );
        expect( uglify( adjusted ) ).toBe( uglify( expected ) );
    }

    beforeEach(() => {
        gen = new TestScriptGenerator(
            new CommandMapper( CODECEPTJS_COMMANDS )
        );
    });

    afterEach( () => {
        gen = null;
    } );

    it( 'generates code for a feature without scenarios and testcases', () => {

        let testCase = {
            "schemaVersion": "1.0",
            "sourceFile": "path/to/somefile.testcase",
            "feature": {
                "location": { "column": 1, "line": 1 },
                "name": "login"
            },
            "scenarios": [],
            "testcases": []
        } as AbstractTestScript;

        let expected = `
            Feature("login");
        `;

        compare( testCase, expected );
    } );


    it( 'generates code for test cases of two different scenarios, even without commands', () => {

        let testCase = {
            "schemaVersion": "1.0",
            "sourceFile": "path/to/somefile.testcase",
            "feature": {
                "location": { "column": 1, "line": 1 },
                "name": "login"
            },
            "scenarios": [
                {
                    "location": { "column": 1, "line": 3 },
                    "name": "successful login"
                },
                {
                    "location": { "column": 1, "line": 3 },
                    "name": "unsuccessful login"
                }
            ],
            "testcases": [
                {
                    "location": { "column": 1, "line": 40 },
                    "scenario": "successful login",
                    "name": "finishes successfully valid values",
                    "commands": []
                },
                {
                    "location": { "column": 1, "line": 41 },
                    "scenario": "unsuccessful login",
                    "name": "finishes unsuccessfully invalid values",
                    invalid: true,
                    "commands": []
                }
            ]
        } as AbstractTestScript;

        let expected = `
            Feature("login");
            Scenario("successful login | finishes successfully valid values", (I) => {});
            Scenario("unsuccessful login | finishes unsuccessfully invalid values", (I) => {});
        `;

        compare( testCase, expected );
    } );


    it( 'generates code for a single test case', () => {

        let testCase = {
            "schemaVersion": "1.0",
            "sourceFile": "path/to/somefile.testcase",
            "feature": {
                "location": { "column": 1, "line": 1 },
                "name": "login"
            },
            "scenarios": [
                {
                    "location": { "column": 1, "line": 3 },
                    "name": "successful login"
                }
            ],
            "testcases": [
                {
                    "location": { "column": 1, "line": 39 },
                    "scenario": "successful login",
                    "name": "finishes successfully with valid values",

                    "commands": [
                        {
                            "location": { "column": 1, "line": 40 },
                            "action": "see",
                            "values": [ "Login" ],
                        },
                        {
                            "location": { "column": 1, "line": 41 },
                            "action": "fill",
                            "targets": [ "#username" ],
                            "targetTypes": [ "textbox" ],
                            "values": [ "bob" ]
                        },
                        {
                            "location": { "column": 1, "line": 42 },
                            "action": "fill",
                            "targets": [ "#password" ],
                            "targetTypes": [ "textbox" ],
                            "values": [ "b0bp4s$" ]
                        },
                        {
                            "location": { "column": 1, "line": 43 },
                            "action": "click",
                            "targets": [ "#enter" ],
                            "targetTypes": [ "button" ]
                        }
                    ]
                }
            ]
        } as AbstractTestScript;

        let expected = `
            Feature("login");

            Scenario("successful login | finishes successfully with valid values", (I) => {
                I.see("Login"); // (40,1)
                I.fillField('#username', "bob"); // (41,1)
                I.fillField('#password', "b0bp4s$"); // (42,1)
                I.click('#enter'); // (43,1)
            });
        `;

        compare( testCase, expected );
    } );


    it( 'generates code for more than one test case', () => {

        let testCase = {
            "schemaVersion": "1.0",
            "sourceFile": "path/to/somefile.testcase",
            "feature": {
                "location": { "column": 1, "line": 1 },
                "name": "login"
            },
            "scenarios": [
                {
                    "location": { "column": 1, "line": 3 },
                    "name": "successful login"
                }
            ],
            "testcases": [
                {
                    "location": { "column": 1, "line": 40 },
                    "scenario": "successful login",
                    "name": "finishes successfully with valid values",

                    "commands": [
                        {
                            "location": { "column": 1, "line": 41 },
                            "action": "see",
                            "values": [ "Login" ]
                        },
                        {
                            "location": { "column": 1, "line": 42 },
                            "action": "fill",
                            "targets": [ "#username" ],
                            "targetTypes": [ "textbox" ],
                            "values": [ "bob" ]
                        },
                        {
                            "location": { "column": 1, "line": 43 },
                            "action": "fill",
                            "targets": [ "#password" ],
                            "targetTypes": [ "textbox" ],
                            "values": [ "b0bp4s$" ]
                        },
                        {
                            "location": { "column": 1, "line": 44 },
                            "action": "click",
                            "targets": [ "#enter" ],
                            "targetTypes": [ "button" ]
                        }
                    ]
                },


                {
                    "location": { "column": 1, "line": 40 },
                    "scenario": "unsuccessful login",
                    "name": "finishes unsuccessfully with invalid values",
                    "invalid": true,

                    "commands": [
                        {
                            "location": { "column": 1, "line": 41 },
                            "action": "see",
                            "values": [ "Login" ]
                        },
                        {
                            "location": { "column": 1, "line": 42 },
                            "action": "fill",
                            "targets": [ "#username" ],
                            "targetTypes": [ "textbox" ],
                            "values": [ "kdsldhçs dwd" ],
                            "invalid": true
                        },
                        {
                            "location": { "column": 1, "line": 43 },
                            "action": "fill",
                            "targets": [ "#password" ],
                            "targetTypes": [ "textbox" ],
                            "values": [ "d0d s98 23923 2 32$" ],
                            "invalid": true
                        },
                        {
                            "location": { "column": 1, "line": 44 },
                            "action": "click",
                            "targets": [ "#enter" ],
                            "targetTypes": [ "button" ]
                        }
                    ]
                }
            ]
        } as AbstractTestScript;

        let expected = `
            Feature("login");

            Scenario("successful login | finishes successfully with valid values", (I) => {
                I.see("Login"); // (41,1)
                I.fillField('#username', "bob"); // (42,1)
                I.fillField('#password', "b0bp4s$"); // (43,1)
                I.click('#enter'); // (44,1)
            });

            Scenario("unsuccessful login | finishes unsuccessfully with invalid values", (I) => {
                I.see("Login"); // (41,1)
                I.fillField('#username', "kdsldhçs dwd"); // (42,1)
                I.fillField('#password', "d0d s98 23923 2 32$"); // (43,1)
                I.click('#enter'); // (44,1)
            });
        `;

        compare( testCase, expected );
    } );

} );
