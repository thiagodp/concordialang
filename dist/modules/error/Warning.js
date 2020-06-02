"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Warning = void 0;
const LocatedException_1 = require("./LocatedException");
/**
 * Warning
 *
 * @author Thiago Delgado Pinto
 */
class Warning extends LocatedException_1.LocatedException {
    constructor() {
        super(...arguments);
        this.name = 'Warning';
        this.isWarning = true;
    }
}
exports.Warning = Warning;
