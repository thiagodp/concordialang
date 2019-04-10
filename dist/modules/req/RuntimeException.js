"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const concordialang_types_1 = require("concordialang-types");
/**
 * Runtime exception
 *
 * @author Thiago Delgado Pinto
 */
class RuntimeException extends concordialang_types_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'RuntimeError';
    }
}
exports.RuntimeException = RuntimeException;
