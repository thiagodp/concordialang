"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JsonSchemaVersionDetector_1 = require("./JsonSchemaVersionDetector");
const JsonSchemaValidator_1 = require("./JsonSchemaValidator");
const VersionUtil_1 = require("./VersionUtil");
const SchemaException_1 = require("./SchemaException");
/**
 * Abstract test schema utilities.
 *
 * @author Thiago Delgado Pinto
 */
class AbstractTestSchemaValidator {
    constructor() {
        this._schemaVersionProperty = 'schemaVersion';
        this._schemaVersionDetector = new JsonSchemaVersionDetector_1.JsonSchemaVersionDetector(this._schemaVersionProperty);
        this._schemaValidator = new JsonSchemaValidator_1.JsonSchemaValidator();
        this._versionUtil = new VersionUtil_1.VersionUtil();
        this._schemaMap = new Map();
        this._lastSchemaVersion = '1.0';
        this._schemaMap.set('1.0', '{"$schema":"http://json-schema.org/draft-04/schema#","definitions":{},"properties":{"feature":{"properties":{"location":{"properties":{"column":{"type":"integer"},"line":{"type":"integer"}},"type":"object"},"name":{"type":"string"}},"type":"object"},"interactions":{"items":{"properties":{"location":{"properties":{"column":{"type":"integer"},"line":{"type":"integer"}},"type":"object"},"name":{"type":"string"}},"type":"object"},"type":"array"},"scenarios":{"items":{"properties":{"location":{"properties":{"column":{"type":"integer"},"line":{"type":"integer"}},"type":"object"},"name":{"type":"string"}},"type":"object"},"type":"array"},"sourceFile":{"type":"string"},"testcases":{"items":{"properties":{"commands":{"items":{"properties":{"action":{"type":"string"},"id":{"type":"string"},"location":{"properties":{"column":{"type":"integer"},"line":{"type":"integer"}},"type":"object"},"targets":{"type":"array"},"targetType":{"type":"string"}},"type":"object"},"type":"array"},"feature":{"type":"string"},"interaction":{"type":"string"},"location":{"properties":{"column":{"type":"integer"},"line":{"type":"integer"}},"type":"object"},"name":{"type":"string"},"scenario":{"type":"string"}},"type":"object"},"type":"array"}},"required":["feature","sourceFile","testcases","scenarios"],"type":"object"}');
    }
    /**
     * Validates a content, throwing an exception if it is not valid.
     *
     * @param content String or object to be validated.
     * @throws SchemaException
     */
    validate(content) {
        // Detects the schema
        let schemaVersion = this._schemaVersionDetector.detect(content);
        if (!schemaVersion) {
            throw new SchemaException_1.SchemaException('Schema version not found.');
        }
        // Find a compatible schema or use the last version
        let versionToUse = this.findCompatibleSchemaVersionFor(schemaVersion) || this._lastSchemaVersion;
        let schema = this._schemaMap.get(versionToUse);
        if (!schema) {
            throw new SchemaException_1.SchemaException('Schema version not available: ' + schema);
        }
        // Validates the content with the schema
        this._schemaValidator.validate(content, schema);
    }
    /**
     * Returns the available schema versions.
     */
    availableSchemaVersions() {
        return [...this._schemaMap.keys()];
    }
    /**
     * Returns a compatible schema version for the given version, or null if not found.
     *
     * @param version Version to be checked.
     */
    findCompatibleSchemaVersionFor(version) {
        const availableVersions = this.availableSchemaVersions();
        for (let av of availableVersions) {
            if (this._versionUtil.areCompatibleVersions(av, version)) {
                return av;
            }
        }
        return null;
    }
}
exports.AbstractTestSchemaValidator = AbstractTestSchemaValidator;
