"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeException = void 0;
const LocatedException_1 = require("./LocatedException");
/**
 * Runtime exception
 *
 * @author Thiago Delgado Pinto
 */
class RuntimeException extends LocatedException_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'RuntimeException';
    }
    static createFrom(error) {
        const e = new RuntimeException(error.message);
        e.stack = error.stack;
        return e;
    }
}
exports.RuntimeException = RuntimeException;
