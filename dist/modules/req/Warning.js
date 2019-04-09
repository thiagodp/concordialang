"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const req_1 = require("concordialang-types/req");
/**
 * Provides an exception that should be handled as a warning.
 *
 * @author Thiago Delgado Pinto
 */
class Warning extends req_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'Warning';
    }
}
exports.Warning = Warning;
