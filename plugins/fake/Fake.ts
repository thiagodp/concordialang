import { Plugin } from '../../modules/plugin/Plugin';
import { AbstractTestScript } from '../../modules/testscript/AbstractTestScript';
import { TestScriptGenerationOptions } from '../../modules/testscript/TestScriptOptions';
import { TestScriptExecutionOptions, TestScriptExecutionResult } from '../../modules/testscript/TestScriptExecution';

/**
 * Fake plugin.
 *
 * @author Thiago Delgado Pinto
 */
export class Fake implements Plugin {

    /** @inheritDoc */
    public async generateCode(
        abstractTestScripts: AbstractTestScript[],
        options: TestScriptGenerationOptions,
        errors: Error[]
    ): Promise< string[] > {
        return []; // No files
    };

    /** @inheritDoc */
    public executeCode = async (options: TestScriptExecutionOptions): Promise< TestScriptExecutionResult > => {

        let r = new TestScriptExecutionResult();
        r.sourceFile = 'nofile.json';
        r.schemaVersion = '1.0';
        r.started = ( new Date() ).toUTCString();
        r.finished = ( new Date() ).toUTCString();
        r.durationMs = 0;
        r.results = [];
        r.total = {
            tests: 4,
            passed: 1,
            error: 1,
            failed: 1,
            skipped: 1,
            unknown: 0
        };

        return r;
    };

    /** @inheritDoc */
    public convertReportFile(filePath: string): Promise< TestScriptExecutionResult > {
        throw new Error("Method not implemented: convertReportFile.");
    }

}