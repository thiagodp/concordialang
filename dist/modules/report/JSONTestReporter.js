import { FileBasedTestReporter } from './FileBasedTestReporter';
/**
 * JSON-based test script execution reporter.
 *
 * @author Thiago Delgado Pinto
 */
export class JSONTestReporter extends FileBasedTestReporter {
    /** @inheritdoc */
    async report(result, options) {
        const fileName = this.makeFilename(options);
        await this._fileWriter.write(fileName, JSON.stringify(result, undefined, "\t"));
    }
    /** @inheritdoc */
    fileExtension() {
        return '.json';
    }
}
