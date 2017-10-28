import { CodeceptJSOptionsBuilder } from '../../../plugins/codeceptjs/CodeceptJSOptionsBuilder';
import { TestScriptExecutionOptions } from '../../../modules/ts/TestScriptExecution';
import { TestCommandGenerator } from '../../../plugins/codeceptjs/TestCommandGenerator';

/**
 * @author Matheus Eller Fagundes
 */
describe( 'TestCommandGeneratorTest', () => {

    let generator: TestCommandGenerator = new TestCommandGenerator(); // under test

    it( 'generate a correct command', () => {
        let options: TestScriptExecutionOptions = new TestScriptExecutionOptions();
        options.sourceCodeDir = '/path/to/test/scripts';

        let command = generator.generateTestCommand( options );
        let configStr = JSON.stringify( new CodeceptJSOptionsBuilder().value() );

        let expectedCommand = `codeceptjs run --steps --override '${ configStr }' -c /path/to/test/scripts`;

        expect( command ).toEqual( expectedCommand );
    } );
    
    it( 'throws error if source code directory is missing', () => {
        let options: TestScriptExecutionOptions = new TestScriptExecutionOptions();
        expect( generator.generateTestCommand ).toThrow();
    } );
    
} );
