import { OutputFileWriter } from '../../../modules/util/OutputFileWriter';
import { CmdRunner } from '../../../modules/cli/CmdRunner';
import { TestScriptExecutor } from '../../../plugins/codeceptjs/TestScriptExecutor';
import { CodeceptJSOptionsBuilder } from '../../../plugins/codeceptjs/CodeceptJSOptionsBuilder';
import { TestScriptExecutionOptions } from '../../../modules/ts/TestScriptExecution';
import * as fs from 'fs';

/**
 * @author Matheus Eller Fagundes
 */
describe( 'TestScriptExecutorTest', () => {

    // under test
    let executor: TestScriptExecutor = new TestScriptExecutor(
        new OutputFileWriter( fs ),
        new CmdRunner()
    );    

    it( 'generates a correct command', () => {

        let options: TestScriptExecutionOptions = new TestScriptExecutionOptions();
        options.sourceCodeDir = '/path/to/test/scripts';

        let command = executor.generateTestCommand( options );
        let configStr = JSON.stringify( new CodeceptJSOptionsBuilder().value() );

        let expectedCommand = `codeceptjs run --steps --override '${ configStr }' -c /path/to/test/scripts`;

        expect( command ).toEqual( expectedCommand );
    } );
    
    it( 'throws an error if source code directory is missing', () => {
        let options: TestScriptExecutionOptions = new TestScriptExecutionOptions();
        expect( executor.generateTestCommand ).toThrow();
    } );
    
} );
