"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
