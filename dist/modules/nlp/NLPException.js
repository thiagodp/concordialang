"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const concordialang_types_1 = require("concordialang-types");
/**
 * Natural Language Processing Exception
 *
 * @author Thiago Delgado Pinto
 */
class NLPException extends concordialang_types_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'NLPError';
    }
}
exports.NLPException = NLPException;
