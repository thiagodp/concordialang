"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const concordialang_types_1 = require("concordialang-types");
/**
 * Semantic exception.
 *
 * @author Thiago Delgado Pinto
 */
class SemanticException extends concordialang_types_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'SemanticError';
    }
}
exports.SemanticException = SemanticException;
