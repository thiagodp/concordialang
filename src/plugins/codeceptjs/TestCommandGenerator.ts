import { CodeceptJSOptionsBuilder } from './CodeceptJSOptionsBuilder';
import { TestScriptExecutionOptions } from '../../modules/ts/TestScriptExecution';

/**
 * Generates commands that runs CodeceptJS.
 * 
 * @author Matheus Eller Fagundes
 */
export class TestCommandGenerator {
    
    /**
     * Generates a command that calls CodeceptJS and can be executed in a terminal.
     * 
     * @param options Execution options
     */
    public generateTestCommand(  options: TestScriptExecutionOptions ): string {
        if( ! options.sourceCodeDir )
            throw new Error( 'Source code directory is missing!' );
        const commandOptions: object = new CodeceptJSOptionsBuilder().value(); //TODO: Accept CodeceptJS options.
        const optionsStr: string = JSON.stringify( commandOptions );
        return `codeceptjs run --steps --override '${optionsStr}' -c ${ options.sourceCodeDir }`;
    }

}
