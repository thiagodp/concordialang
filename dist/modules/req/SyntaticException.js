"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const concordialang_types_1 = require("concordialang-types");
/**
 * Syntatic exception
 *
 * @author Thiago Delgado Pinto
 */
class SyntaticException extends concordialang_types_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'SyntaxError';
    }
}
exports.SyntaticException = SyntaticException;
