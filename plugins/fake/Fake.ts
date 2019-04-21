import {
    AbstractTestScript,
    TestScriptGenerationOptions,
    TestScriptExecutionOptions,
    TestScriptExecutionResult
} from 'concordialang-types';
import { Plugin } from 'concordialang-plugin';

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
    public async executeCode(options: TestScriptExecutionOptions): Promise< TestScriptExecutionResult > {

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
    public async convertReportFile(filePath: string): Promise< TestScriptExecutionResult > {
        throw new Error("Method not implemented: convertReportFile.");
    }

    /** @inheritDoc */
    public async defaultReportFile(): Promise< string > {
        return 'fake-output.json';
    }

}