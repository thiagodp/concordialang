import { TestScriptExecutionResult } from 'concordialang-types';
import { join } from 'path';

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

export const DEFAULT_FILENAME: string = 'concordia-report';

/**
 * File-based test reporter.
 *
 * @author Thiago Delgado Pinto
 */
export abstract class FileBasedTestReporter
    implements TestReporter< FileBasedTestReporterOptions > {

    constructor( protected readonly _fileWriter: FileWriter ) {}

    /** @inheritdoc */
    abstract report(
        result: TestScriptExecutionResult,
        options?: FileBasedTestReporterOptions
    ): Promise< void >;


    /** Returns the intended file extension */
    abstract fileExtension(): string;


    /** Creates a file name from the given options */
    makeFilename(options?: FileBasedTestReporterOptions): string {
        let fileName = options?.file || DEFAULT_FILENAME;
        if ( options?.directory ) {
            fileName = join( options.directory, fileName );
        }
        fileName = changeFileExtension( fileName, this.fileExtension() );
        if ( options?.useTimestamp ) {
            fileName = addTimeStampToFilename( fileName, new Date() );
        }
        return fileName;
    }

}