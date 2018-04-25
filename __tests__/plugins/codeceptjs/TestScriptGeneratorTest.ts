import { AbstractTestScript } from '../../../modules/testscript/AbstractTestScript';
import { TestScriptGenerator } from "../../../plugins/codeceptjs/TestScriptGenerator";

/**
 * @author Matheus Eller Fagundes
 * @author Thiago Delgado Pinto
 */
describe( 'TestScriptGeneratorTest', () => {

    let gen: TestScriptGenerator; // under test

    const comment = '/** Generated with <3 by Concordia. Run the following tests using CodeceptJS. */';

    function uglify(string: string): string{
        return string.replace(/(\r\n|\n|\r|[ \t])/gm, '');
    }

    beforeEach(() => {
        gen = new TestScriptGenerator();
    });

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
            ${comment}
            Feature('login');
        `;

        expect( uglify( gen.generate( testCase ) ) ).toBe( uglify( expected ) );
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
            ${comment}
            Feature('login');
            Scenario('successful login | finishes successfully valid values', (I) => {});
            Scenario('unsuccessful login | finishes unsuccessfully invalid values', (I) => {});
        `;

        expect( uglify( gen.generate( testCase ) ) ).toBe( uglify( expected ) );
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
                    "location": { "column": 1, "line": 40 },
                    "scenario": "successful login",
                    "name": "finishes successfully with valid values",

                    "commands": [
                        {
                            "location": { "column": 1, "line": 41 },
                            "action": "see",
                            "targets": [ "Login" ],
                            "targetTypes": [ "text" ]
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
            ${comment}

            Feature('login');

            Scenario('successful login | finishes successfully with valid values', (I) => {
                I.see('Login');
                I.fillField('#username', 'bob');
                I.fillField('#password', 'b0bp4s$');
                I.click('#enter');
            });
        `;

        expect( uglify( gen.generate( testCase ) ) ).toBe( uglify( expected ) );
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
                            "targets": [ "Login" ],
                            "targetTypes": [ "text" ]
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
                            "location": { "column": 1, "line": 43 },
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
                            "targets": [ "Login" ],
                            "targetTypes": [ "text" ]
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
            ${comment}

            Feature('login');

            Scenario('successful login | finishes successfully with valid values', (I) => {
                I.see('Login');
                I.fillField('#username', 'bob');
                I.fillField('#password', 'b0bp4s$');
                I.click('#enter');
            });

            Scenario('unsuccessful login | finishes unsuccessfully with invalid values', (I) => {
                I.see('Login');
                I.fillField('#username', 'kdsldhçs dwd');
                I.fillField('#password', 'd0d s98 23923 2 32$');
                I.click('#enter');
            });
        `;

        expect( uglify( gen.generate( testCase ) ) ).toBe( uglify( expected ) );
    } );

} );
