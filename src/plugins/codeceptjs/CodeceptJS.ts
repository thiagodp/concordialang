import { TestScriptPlugin } from '../../modules/plugin/TestScriptPlugin';
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
    isFake(): boolean {
        return false;    
    }
    
    /** @inheritDoc */
    name(): string {
        return 'concordialang-codeceptjs';
    }

    /** @inheritDoc */
    description(): string {
        return 'Generate test scripts for CodeceptJS'
    }

    /** @inheritDoc */
    version(): string {
        return this.VERSION;
    }

    /** @inheritDoc */
    targets(): string[] {
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