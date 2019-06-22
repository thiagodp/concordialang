"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LocatedException_1 = require("../dbi/LocatedException");
/**
 * Natural Language Processing Exception
 *
 * @author Thiago Delgado Pinto
 */
class NLPException extends LocatedException_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'NLPError';
    }
}
exports.NLPException = NLPException;
