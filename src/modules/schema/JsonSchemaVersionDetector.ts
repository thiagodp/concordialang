/**
 * JSON schema version detector.
 * 
 * @author Thiago Delgado Pinto
 */
export class JsonSchemaVersionDetector {
    
    /**
     * Creates the detector.
     * 
     * @param _schemaVersionProperty Property to be used as schema version.
     */
    constructor( private _schemaVersionProperty: string ) {
    }

    /**
     * Returns the detected schema version of a content, or null if the detection is not possible.
     * 
     * @param content String or object to have the version detected.
     */
    public detect( content: string | Object ): string | null {
        
        let obj: Object | any;
        if ( typeof content === 'string' ) {
            try {
                obj = JSON.parse( content );
            } catch( e ) { // SyntaxError
                return null;
            }
        } else {
            obj = content;
        }
        if ( obj && obj.hasOwnProperty( this._schemaVersionProperty ) ) {
            return obj[ this._schemaVersionProperty ];
        }
        return null;
    }    
}
