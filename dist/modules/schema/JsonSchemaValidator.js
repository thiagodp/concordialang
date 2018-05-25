"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SchemaException_1 = require("./SchemaException");
const validator = require("is-my-json-valid");
/**
 * JSON schema validator
 *
 * @author Thiago Delgado Pinto
 */
class JsonSchemaValidator {
    /**
     * Throws a SchemaException in case of error.
     *
     * @param content String or object to be validated.
     */
    validate(content, schema) {
        let obj;
        if (typeof content === 'string') {
            try {
                obj = JSON.parse(content);
            }
            catch (e) { // SyntaxError
                throw new SchemaException_1.SchemaException(e.message);
            }
        }
        else {
            obj = content;
        }
        let isValid;
        try {
            let validate = validator(schema, { verbose: true });
            isValid = validate(obj);
        }
        catch (e) {
            throw new SchemaException_1.SchemaException(e.message);
        }
        if (!isValid) {
            throw new SchemaException_1.SchemaException('JSON content does not match the given schema.');
        }
    }
}
exports.JsonSchemaValidator = JsonSchemaValidator;
