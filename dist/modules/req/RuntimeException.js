"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const req_1 = require("concordialang-types/req");
/**
 * Runtime exception
 *
 * @author Thiago Delgado Pinto
 */
class RuntimeException extends req_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'RuntimeError';
    }
}
exports.RuntimeException = RuntimeException;
