"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
}
exports.RuntimeException = RuntimeException;
