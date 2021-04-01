"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileBasedTestReporter = exports.DEFAULT_FILENAME = void 0;
const ext_changer_1 = require("../util/fs/ext-changer");
exports.DEFAULT_FILENAME = 'cc-report';
/**
 * File-based test reporter.
 *
 * @author Thiago Delgado Pinto
 */
class FileBasedTestReporter {
    constructor(_fileWriter, _pathLibrary) {
        this._fileWriter = _fileWriter;
        this._pathLibrary = _pathLibrary;
    }
    /** Creates a file name from the given options */
    makeFilename(options) {
        const { join } = this._pathLibrary;
        let fileName = options ? options.file || exports.DEFAULT_FILENAME : exports.DEFAULT_FILENAME;
        const fileExtension = this.fileExtension();
        fileName = ext_changer_1.changeFileExtension(fileName, fileExtension, this._pathLibrary);
        if (!options) {
            return fileName;
        }
        fileName = join(options.directory || '.', fileName);
        if (options.useTimestamp) {
            fileName = ext_changer_1.addTimeStampToFilename(fileName, fileExtension, new Date(), this._pathLibrary);
        }
        return fileName;
    }
}
exports.FileBasedTestReporter = FileBasedTestReporter;
