"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticException = void 0;
const RuntimeException_1 = require("./RuntimeException");
/**
 * Semantic exception.
 *
 * @author Thiago Delgado Pinto
 */
class SemanticException extends RuntimeException_1.RuntimeException {
    constructor() {
        super(...arguments);
        this.name = 'SemanticException';
    }
}
exports.SemanticException = SemanticException;
