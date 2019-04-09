"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const req_1 = require("concordialang-types/req");
/**
 * Natural Language Processing Exception
 *
 * @author Thiago Delgado Pinto
 */
class NLPException extends req_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'NLPError';
    }
}
exports.NLPException = NLPException;
