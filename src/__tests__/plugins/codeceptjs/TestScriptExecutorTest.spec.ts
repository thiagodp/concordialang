import { FileUtil } from '../../../modules/util/FileUtil';
import { CmdRunner } from '../../../modules/cli/CmdRunner';
import { TestScriptExecutor } from '../../../plugins/codeceptjs/TestScriptExecutor';
import { CodeceptJSOptionsBuilder } from '../../../plugins/codeceptjs/CodeceptJSOptionsBuilder';
import { TestScriptExecutionOptions } from '../../../modules/ts/TestScriptExecution';
import { fs as memfs, vol } from 'memfs';
import { join } from 'path';

/**
 * @author Matheus Eller Fagundes
 */
describe( 'TestScriptExecutorTest', () => {

    // under test
    let executor: TestScriptExecutor = new TestScriptExecutor(
        new FileUtil( memfs ),
        new CmdRunner()
    );

    it( 'generates a correct command', () => {

        let options: TestScriptExecutionOptions = new TestScriptExecutionOptions();
        options.sourceCodeDir = '/path/to/test/scripts';
        options.executionResultDir = '/path/to/result/dir'

        const outputFile = join( options.executionResultDir, 'output.json' );
        
        let command = executor.generateTestCommand( options, outputFile );
        let configStr = JSON.stringify( new CodeceptJSOptionsBuilder().withOutputFile( outputFile ).value() );

        let expectedCommand = `codeceptjs run --reporter mocha-multi --override '${ configStr }' -c /path/to/test/scripts`;

        expect( command ).toEqual( expectedCommand );
    } );
    
    it( 'throws an error if source code directory is missing', () => {
        let options: TestScriptExecutionOptions = new TestScriptExecutionOptions();
        options.executionResultDir = 'some_dir';
        let testFunction = () => {
            executor.generateTestCommand( options, 'someFile.json' )
        };
        expect( testFunction ).toThrowError( /missing/ );
    } );

    it( 'throws an error if execution result directory is missing', () => {
        let options: TestScriptExecutionOptions = new TestScriptExecutionOptions();
        options.sourceCodeDir = 'some_dir';
        let testFunction = () => {
            executor.generateTestCommand( options, 'someFile.json' )
        };
        expect( testFunction ).toThrowError( /missing/ );
    } );

} );
