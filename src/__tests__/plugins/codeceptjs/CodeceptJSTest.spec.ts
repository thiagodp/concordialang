import { TestScriptExecutionOptions } from '../../../modules/ts/TestScriptExecution';
import { CodeceptJS } from "../../../plugins/codeceptjs/CodeceptJS";

/**
* @author Matheus Eller Fagundes
*/
describe( 'CodeceptJSTest', () => {

    let plugin: CodeceptJS = new CodeceptJS(); // under test
    
    it( 'should execute code', () => {
        let options: TestScriptExecutionOptions = new TestScriptExecutionOptions();
        options.resultDir = '/home/matheus/concordia';
        plugin.executeCode( options );
    } );
    
} );
