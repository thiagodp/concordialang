"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LocatedException_1 = require("./LocatedException");
/**
 * Provides an exception that should be handled as a warning.
 *
 * @author Thiago Delgado Pinto
 */
class Warning extends LocatedException_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'Warning';
    }
}
exports.Warning = Warning;
