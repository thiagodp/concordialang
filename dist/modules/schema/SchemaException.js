"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Schema exception
 *
 * @author Thiago Delgado Pinto
 */
class SchemaException extends Error {
    constructor() {
        super(...arguments);
        this.name = 'SchemaError';
    }
}
exports.SchemaException = SchemaException;
