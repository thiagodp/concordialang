import { Plugin } from '../../modules/plugin/Plugin';
import { AbstractTestScript } from '../../modules/testscript/AbstractTestScript';
import { TestScriptGenerationOptions } from '../../modules/testscript/TestScriptGeneration';
import { TestScriptExecutionOptions, TestScriptExecutionResult } from '../../modules/testscript/TestScriptExecution';

/**
 * Fake plugin.
 * 
 * @author Thiago Delgado Pinto
 */
export class Fake implements Plugin {

    /** @inheritDoc */
    public generateCode(
        abstractTestScripts: AbstractTestScript[],
        options: TestScriptGenerationOptions
    ): Promise< string >[] {
        throw new Error("Method not implemented.");
    };

    /** @inheritDoc */
    public executeCode(options: TestScriptExecutionOptions): Promise< TestScriptExecutionResult > {
        throw new Error("Method not implemented.");
    }

    /** @inheritDoc */
    public convertReportFile(filePath: string): Promise< TestScriptExecutionResult > {
        throw new Error("Method not implemented.");
    }

}