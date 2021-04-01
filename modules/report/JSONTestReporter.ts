import { TestScriptExecutionResult } from 'concordialang-types';

import { FileBasedTestReporter, FileBasedTestReporterOptions } from './FileBasedTestReporter';

/**
 * JSON-based test script execution reporter.
 *
 * @author Thiago Delgado Pinto
 */
export class JSONTestReporter extends FileBasedTestReporter {

    /** @inheritdoc */
    async report(
        result: TestScriptExecutionResult,
        options?: FileBasedTestReporterOptions
    ): Promise<void> {
        const fileName = this.makeFilename( options );
        await this._fileWriter.write( fileName, JSON.stringify( result, undefined, "\t" ) );
    }

    /** @inheritdoc */
    fileExtension(): string {
        return '.json';
    }

}