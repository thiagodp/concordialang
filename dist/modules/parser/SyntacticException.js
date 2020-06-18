"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LocatedException_1 = require("../error/LocatedException");
/**
 * Syntactic exception
 *
 * @author Thiago Delgado Pinto
 */
class SyntacticException extends LocatedException_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'SyntacticError';
    }
}
exports.SyntacticException = SyntacticException;
