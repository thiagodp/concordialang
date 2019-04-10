"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const concordialang_types_1 = require("concordialang-types");
/**
 * Provides an exception that should be handled as a warning.
 *
 * @author Thiago Delgado Pinto
 */
class Warning extends concordialang_types_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'Warning';
    }
}
exports.Warning = Warning;
