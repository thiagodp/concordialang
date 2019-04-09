"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const req_1 = require("concordialang-types/req");
/**
 * Syntatic exception
 *
 * @author Thiago Delgado Pinto
 */
class SyntaticException extends req_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'SyntaxError';
    }
}
exports.SyntaticException = SyntaticException;
