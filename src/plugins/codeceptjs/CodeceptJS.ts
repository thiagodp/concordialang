import { TestScriptPlugin } from '../../modules/ts/TestScriptPlugin';
import { AbstractTestScript } from '../../modules/ts/AbstractTestScript';
import { TestScriptGenerationOptions, TestScriptGenerationResult } from '../../modules/ts/TestScriptGeneration';
import { TestScriptExecutionOptions, TestScriptExecutionResult } from '../../modules/ts/TestScriptExecution';

/**
 * Plugin for CodeceptJS.
 * 
 * @author Thiago Delgado Pinto
 */
export class CodeceptJS implements TestScriptPlugin {

    private VERSION: string = '0.1';

    /** @inheritDoc */
    public isFake(): boolean {
        return false;    
    }
    
    /** @inheritDoc */
    public name(): string {
        return 'concordialang-codeceptjs';
    }

    /** @inheritDoc */
    public description(): string {
        return 'Generate test scripts for CodeceptJS'
    }

    /** @inheritDoc */
    public version(): string {
        return this.VERSION;
    }

    /** @inheritDoc */
    public targets(): string[] {
        return [ 'CodeceptJS' ];
    }  

    /** @inheritDoc */
    public generateCode(
        abstractTestScripts: AbstractTestScript[],
        options: TestScriptGenerationOptions
    ): TestScriptGenerationResult {
        throw new Error('Not implemented yet.');
    }

    /** @inheritDoc */
    public executeCode( options: TestScriptExecutionOptions ): TestScriptExecutionResult {
        throw new Error('Not implemented yet.');
    }

    /** @inheritDoc */
    public convertReportFile( filePath: string ): TestScriptExecutionResult {
        throw new Error('Not implemented yet.');
    }
}