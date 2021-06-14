/**
 * Provides an exception that contains information about its location.
 *
 * @author Thiago Delgado Pinto
 */
export class LocatedException extends Error {
    constructor(message, location, messageShouldIncludeFilePath = false) {
        super(LocatedException.makeExceptionMessage(message, location, messageShouldIncludeFilePath));
        this.location = location;
        this.name = 'LocatedException';
        this.isWarning = false;
    }
    static makeExceptionMessage(originalMessage, location, includeFilePath = false) {
        let msg = '';
        if (location) {
            msg += '(' + location.line + ',' + location.column + ') ';
            if (includeFilePath && location.filePath) {
                msg += location.filePath + ': ';
            }
        }
        msg += originalMessage || '';
        return msg;
    }
}
