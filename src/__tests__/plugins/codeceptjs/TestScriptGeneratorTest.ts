import { TestScriptGenerator } from "../../../plugins/codeceptjs/TestScriptGenerator";

/**
* @author Matheus Eller Fagundes
*/
describe( 'TestScriptGeneratorTest', () => {

    let gen: TestScriptGenerator; // under test

    function uglify(string: string): string{
        return string.replace(/(\r\n|\n|\r|[ \t])/gm, '');
    }    
    
    beforeEach(() => {
        gen = new TestScriptGenerator();
    });

    it( 'should parse a simple feature structure with one scenario', () => {
        let testCase: any = {
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
            "testcases": [ ]
        }
        

        let expected = `
            /** Generated with <3 by Concordia. Run the following tests using CodeceptJS. */
            Feature('login');
            Scenario('successful login', (I) => {});
        `;

        expect( uglify( gen.generateScript( testCase ) ) ).toBe( uglify( expected ) );
    } );
    
    it( 'should parse a simple feature structure with two scenarios', () => {
        let testCase: any = {
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
            "testcases": [ ]
        }

        let expected = `
            /** Generated with <3 by Concordia. Run the following tests using CodeceptJS. */
            Feature('login');
            Scenario('successful login', (I) => {});
            Scenario('unsuccessful login', (I) => {});
        `;

        expect( uglify( gen.generateScript( testCase ) ) ).toBe( uglify( expected ) );
    } );

    it( 'should parse a simple feature structure with one scenario with actions', () => {
        let testCase: any = {
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
                    "name": "successful login",
                    "invalid": true,
        
                    "feature": "login",
                    "scenario": "successful login",
        
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
                            "invalid": true
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
        }

        let expected = `
            /** Generated with <3 by Concordia. Run the following tests using CodeceptJS. */
            Feature('login');
            Scenario('successful login', (I) => {
                I.see('Login');
                I.fillField('#username', 'bob');
                I.click('#enter');
            });
        `;

        expect( uglify( gen.generateScript( testCase ) ) ).toBe( uglify( expected ) );
    } );
    
} );
