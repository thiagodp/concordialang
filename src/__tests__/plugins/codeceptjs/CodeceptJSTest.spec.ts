import { spawn, exec } from 'child_process';
import { TestScriptGenerationOptions } from '../../../modules/testscript/TestScriptGeneration';
import { TestCaseGenerationOptions } from '../../../modules/testcase/TestCaseOptions';
import { AbstractTestScript } from '../../../modules/testscript/AbstractTestScript';
import { TestScriptExecutionOptions } from '../../../modules/testscript/TestScriptExecution';
import { CodeceptJS } from "../../../plugins/codeceptjs/CodeceptJS";

import { fs as memfs, vol } from 'memfs';

/**
 * @author Matheus Eller Fagundes
 * @author Thiago Delgado Pinto
 */
describe( 'CodeceptJSTest', () => {

    let plugin: CodeceptJS = new CodeceptJS( memfs ); // under test

    afterEach( () => {
        vol.reset(); // erase in-memory files
    } );

    // @see https://facebook.github.io/jest/docs/en/asynchronous.html#promises
    it( 'generate files with the right file names', () => {

        let expectedFileNames: string[] = [
            'add-product-to-the-shopping-cart.js',
            'remove-product-from-the-shopping-cart.js'
        ];

        const outputDir = './';
        const file1 = expectedFileNames[ 0 ];
        const file2 = expectedFileNames[ 1 ];
        const json = {
            file1: '1',
            file2: '2'
        };
        vol.fromJSON( json, '.' );

        let scripts: AbstractTestScript[] = [
            {
                feature: { name: 'Add Product to the Shopping Cart' },
                scenarios: [
                    { name: 'Scenario 1' }
                ],
                testcases: []
            } as AbstractTestScript,

            {
                feature: { name: 'Remove Product from the Shopping Cart' },
                scenarios: [
                    { name: 'Scenario 1' }
                ],
                testcases: []
            } as AbstractTestScript,            
        ];

        let options: TestScriptGenerationOptions = new TestScriptGenerationOptions();
        options.sourceCodeDir = outputDir;

        let promises: Promise< string >[] = plugin.generateCode( scripts, options );
        return Promise.all( promises )
            .then( ( fileNames: string[] ) => {
                expect( fileNames ).toEqual( expectedFileNames );
            } );
    } );

    
} );
