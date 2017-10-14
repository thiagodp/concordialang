import { JsonSchemaVersionDetector } from './JsonSchemaVersionDetector';
import { JsonSchemaValidator } from './JsonSchemaValidator';
import { VersionUtil } from './VersionUtil';
import { SchemaException } from './SchemaException';

/**
 * Abstract test schema utilities.
 * 
 * @author Thiago Delgado Pinto
 */
export class AbstractTestSchemaValidator {

    private _schemaVersionProperty: string = 'schemaVersion';
    private _schemaVersionDetector = new JsonSchemaVersionDetector( this._schemaVersionProperty );
    private _schemaValidator = new JsonSchemaValidator();
    private _versionUtil = new VersionUtil();

    private _schemaMap: any = {
        '1.0': '{"$schema":"http://json-schema.org/draft-04/schema#","definitions":{},"properties":{"feature":{"properties":{"location":{"properties":{"column":{"type":"integer"},"line":{"type":"integer"}},"type":"object"},"name":{"type":"string"}},"type":"object"},"interactions":{"items":{"properties":{"location":{"properties":{"column":{"type":"integer"},"line":{"type":"integer"}},"type":"object"},"name":{"type":"string"}},"type":"object"},"type":"array"},"scenarios":{"items":{"properties":{"location":{"properties":{"column":{"type":"integer"},"line":{"type":"integer"}},"type":"object"},"name":{"type":"string"}},"type":"object"},"type":"array"},"sourceFile":{"type":"string"},"testcases":{"items":{"properties":{"commands":{"items":{"properties":{"action":{"type":"string"},"id":{"type":"string"},"location":{"properties":{"column":{"type":"integer"},"line":{"type":"integer"}},"type":"object"},"targets":{"type":"array"},"targetType":{"type":"string"}},"type":"object"},"type":"array"},"feature":{"type":"string"},"interaction":{"type":"string"},"location":{"properties":{"column":{"type":"integer"},"line":{"type":"integer"}},"type":"object"},"name":{"type":"string"},"scenario":{"type":"string"}},"type":"object"},"type":"array"}},"required":["feature","sourceFile","testcases","scenarios"],"type":"object"}'
    };
    private _lastSchemaVersion: string = '1.0';


    /**
     * Validates a content, throwing an exception if it is not valid.
     * 
     * @param content String or object to be validated.
     * @throws SchemaException
     */
    public validate( content: string | object ): void {
        // Detects the schema
        let schemaVersion: string | null = this._schemaVersionDetector.detect( content );
        if ( ! schemaVersion ) {
            throw new SchemaException( 'Schema version not found.' );
        }
        // Find a compatible schema or use the last version
        let versionToUse: string = 
            this.findCompatibleSchemaVersionFor( schemaVersion ) || this._lastSchemaVersion;
        let schema = this._schemaMap[ versionToUse ];
        if ( ! schema ) {
            throw new SchemaException( 'Schema version not available: ' + schema );
        }
        // Validates the content with the schema
        this._schemaValidator.validate( content, schema );
    }

    /**
     * Returns the available schema versions.
     */
    public availableSchemaVersions(): string[] {
        let versions: string[] = [];
        for ( let [ key, val ] of this._schemaMap ) {
            versions.push( key );
        }
        return versions;
    }

    /**
     * Returns a compatible schema version for the given version, or null if not found.
     * 
     * @param version Version to be checked.
     */
    public findCompatibleSchemaVersionFor( version: string ): string | null {
        for ( let sv of this.availableSchemaVersions() ) {
            if ( this._versionUtil.areCompatibleVersions( sv, version ) ) {
                return sv;
            }
        }
        return null;
    }

}
