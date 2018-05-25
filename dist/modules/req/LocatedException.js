"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Provides an exception that contains information about the location of an error in a line.
 *
 * @author Thiago Delgado Pinto
 */
class LocatedException extends Error {
    constructor(message, location) {
        super(LocatedException.makeExceptionMessage(message, location));
        this.location = location;
    }
    static makeExceptionMessage(originalMessage, location) {
        let msg = '';
        if (location) {
            msg += '(' + location.line + ',' + location.column + ') ';
            if (location.filePath) {
                msg += location.filePath + ': ';
            }
        }
        msg += originalMessage || '';
        return msg;
    }
}
exports.LocatedException = LocatedException;
