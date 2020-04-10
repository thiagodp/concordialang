"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Provides an exception that contains information about its location.
 *
 * @author Thiago Delgado Pinto
 */
class LocatedException extends Error {
    constructor(message, location, showFilePath = false) {
        super(LocatedException.makeExceptionMessage(message, location, showFilePath));
        this.location = location;
        this.name = 'LocatedException';
    }
    static makeExceptionMessage(originalMessage, location, showFilePath = false) {
        let msg = '';
        if (location) {
            msg += '(' + location.line + ',' + location.column + ') ';
            if (showFilePath && location.filePath) {
                msg += location.filePath + ': ';
            }
        }
        msg += originalMessage || '';
        return msg;
    }
}
exports.LocatedException = LocatedException;
