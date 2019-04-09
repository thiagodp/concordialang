"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const req_1 = require("concordialang-types/req");
/**
 * Semantic exception.
 *
 * @author Thiago Delgado Pinto
 */
class SemanticException extends req_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'SemanticError';
    }
}
exports.SemanticException = SemanticException;
