import { join } from 'path';
import { addTimeStampToFilename, changeFileExtension } from '../util/fs/ext-changer';
export const DEFAULT_FILENAME = 'concordia-report';
/**
 * File-based test reporter.
 *
 * @author Thiago Delgado Pinto
 */
export class FileBasedTestReporter {
    constructor(_fileWriter) {
        this._fileWriter = _fileWriter;
    }
    /** Creates a file name from the given options */
    makeFilename(options) {
        let fileName = options?.file || DEFAULT_FILENAME;
        if (options?.directory) {
            fileName = join(options.directory, fileName);
        }
        fileName = changeFileExtension(fileName, this.fileExtension());
        if (options?.useTimestamp) {
            fileName = addTimeStampToFilename(fileName, new Date());
        }
        return fileName;
    }
}
