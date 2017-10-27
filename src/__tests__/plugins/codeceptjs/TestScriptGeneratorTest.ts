import { AbstractTestScript } from '../../../modules/ts/AbstractTestScript';
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

    it( 'should generate code for a simple feature without testcases', () => {

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
    

    it( 'should generate code for test cases of two different scenarios, even without commands', () => {
        
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


    it( 'should generate code for one test case with commands', () => {

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
                    "name": "finishes successfully valid values",
        
                    "commands": [
                        {
                            "location": { "column": 1, "line": 41 },
                            "action": "see",
                            "targets": [ "Login" ],
                            "targetType": "text"
                        },
                        {
                            "location": { "column": 1, "line": 42 },
                            "action": "fill",
                            "targets": [ "#username" ],
                            "targetType": "textbox",
                            "values": [ "bob" ],
                        },
                        {
                            "location": { "column": 1, "line": 43 },
                            "action": "fill",
                            "targets": [ "#password" ],
                            "targetType": "textbox",
                            "values": [ "b0bp4s$" ],
                        },                        
                        {
                            "location": { "column": 1, "line": 43 },
                            "action": "click",
                            "targets": [ "#enter" ],
                            "targetType": "button"
                        }                
                    ]
                }        
            ]
        } as AbstractTestScript;

        let expected = `
            ${comment}
            
            Feature('login');

            Scenario('successful login | finishes successfully valid values', (I) => {
                I.see('Login');
                I.fillField('#username', 'bob');
                I.fillField('#password', 'b0bp4s$');
                I.click('#enter');
            });
        `;

        expect( uglify( gen.generate( testCase ) ) ).toBe( uglify( expected ) );
    } );
    
} );
