"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LocatedException_1 = require("../error/LocatedException");
/**
 * Lexical exception.
 *
 * @author Thiago Delgado Pinto
 */
class LexicalException extends LocatedException_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'LexicalError';
    }
}
exports.LexicalException = LexicalException;
