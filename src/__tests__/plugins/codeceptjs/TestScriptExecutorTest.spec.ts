import { FileUtil } from '../../../modules/util/FileUtil';
import { CmdRunner } from '../../../modules/cli/CmdRunner';
import { TestScriptExecutor } from '../../../plugins/codeceptjs/TestScriptExecutor';
import { CodeceptJSOptionsBuilder } from '../../../plugins/codeceptjs/CodeceptJSOptionsBuilder';
import { TestScriptExecutionOptions } from '../../../modules/ts/TestScriptExecution';
import { fs as memfs, vol } from 'memfs';

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

        let command = executor.generateTestCommand( options );
        let configStr = JSON.stringify( new CodeceptJSOptionsBuilder().value() );

        let expectedCommand = `codeceptjs run --reporter=JSON --override '${ configStr }' -c /path/to/test/scripts`;

        expect( command ).toEqual( expectedCommand );
    } );
    
    it( 'throws an error if source code directory is missing', () => {
        let options: TestScriptExecutionOptions = new TestScriptExecutionOptions();
        expect( executor.generateTestCommand ).toThrow();
    } );

    it( 'generate test result files with the right file names', () => {
        let expectedRegex = /codecept_[0-9]{4}-[0-1][0-9]-[0-3][0-9]_[0-2][0-9]h[0-6][0-9]m[0-6][0-9]s.json/;
        return expect( executor.writeResult( {}, '/some_dir/' ) ).resolves.toMatch( expectedRegex );
    } );

    it( 'writes the right content to file', () => {
        let resultMock = { test: { result: { ok: true } } };
        return executor.writeResult( resultMock, '/some_dir/' )
            .then( ( path: string ) => {
                expect( memfs.readFileSync( path, { encoding: 'utf8' } ) ).toBe( JSON.stringify( resultMock ) );
            } );
    } );
    
} );
