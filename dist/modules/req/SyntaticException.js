"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LocatedException_1 = require("./LocatedException");
/**
 * Syntatic exception
 *
 * @author Thiago Delgado Pinto
 */
class SyntaticException extends LocatedException_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'SyntaxError';
    }
}
exports.SyntaticException = SyntaticException;
//# sourceMappingURL=SyntaticException.js.map