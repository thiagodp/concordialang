"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticException = void 0;
const LocatedException_1 = require("../error/LocatedException");
/**
 * Semantic exception.
 *
 * @author Thiago Delgado Pinto
 */
class SemanticException extends LocatedException_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'SemanticError';
    }
}
exports.SemanticException = SemanticException;
