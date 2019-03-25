"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Specification
 *
 * @author Thiago Delgado Pinto
 */
class Spec {
    constructor(basePath) {
        this.basePath = null;
        this.docs = [];
        this.basePath = basePath || process.cwd();
    }
}
exports.Spec = Spec;
