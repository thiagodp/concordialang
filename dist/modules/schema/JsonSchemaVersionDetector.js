"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * JSON schema version detector.
 *
 * @author Thiago Delgado Pinto
 */
class JsonSchemaVersionDetector {
    /**
     * Creates the detector.
     *
     * @param _schemaVersionProperty Property to be used as schema version.
     */
    constructor(_schemaVersionProperty) {
        this._schemaVersionProperty = _schemaVersionProperty;
    }
    /**
     * Returns the detected schema version of a content, or null if the detection is not possible.
     *
     * @param content String or object to have the version detected.
     */
    detect(content) {
        let obj;
        if (typeof content === 'string') {
            try {
                obj = JSON.parse(content);
            }
            catch (e) {
                return null;
            }
        }
        else {
            obj = content;
        }
        if (obj && obj.hasOwnProperty(this._schemaVersionProperty)) {
            return obj[this._schemaVersionProperty];
        }
        return null;
    }
}
exports.JsonSchemaVersionDetector = JsonSchemaVersionDetector;
//# sourceMappingURL=JsonSchemaVersionDetector.js.map