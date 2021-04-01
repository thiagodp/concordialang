import { TestScriptExecutionResult } from 'concordialang-types';

import { FileWriter } from '../util/file/FileWriter';
import { addTimeStampToFilename, changeFileExtension } from '../util/fs/ext-changer';
import { TestReporter, TestReporterOptions } from './TestReporter';

/**
 * File-based test reporter options.
 */
export interface FileBasedTestReporterOptions extends TestReporterOptions {
    directory?: string;
    file?: string;
    useTimestamp?: boolean;
}

export const DEFAULT_FILENAME: string = 'cc-report';

/**
 * File-based test reporter.
 *
 * @author Thiago Delgado Pinto
 */
export abstract class FileBasedTestReporter
    implements TestReporter< FileBasedTestReporterOptions > {

    constructor(
        protected readonly _fileWriter: FileWriter,
        protected readonly _pathLibrary: any,
    ) {
    }


    /** @inheritdoc */
    abstract report(
        result: TestScriptExecutionResult,
        options?: FileBasedTestReporterOptions
    ): Promise< void >;


    /** Returns the intended file extension */
    abstract fileExtension(): string;


    /** Creates a file name from the given options */
    makeFilename(options?: FileBasedTestReporterOptions): string {
        const { join } = this._pathLibrary;
        let fileName = options ? options.file || DEFAULT_FILENAME : DEFAULT_FILENAME;
        const fileExtension = this.fileExtension();
        fileName = changeFileExtension( fileName, fileExtension, this._pathLibrary );
        if ( ! options ) {
            return fileName;
        }
        fileName = join( options.directory || '.', fileName );
        if ( options.useTimestamp ) {
            fileName = addTimeStampToFilename(
                fileName, fileExtension, new Date(), this._pathLibrary );
        }
        return fileName;
    }

}