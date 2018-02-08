import { SchemaException } from './SchemaException';
import validator = require( 'is-my-json-valid' );

/**
 * JSON schema validator
 * 
 * @author Thiago Delgado Pinto
 */
export class JsonSchemaValidator {

    /**
     * Throws a SchemaException in case of error.
     * 
     * @param content String or object to be validated.
     */
    public validate( content: string | Object, schema: string ): void {

        let obj: Object | any;
        if ( typeof content === 'string' ) {
            try {
                obj = JSON.parse( content );
            } catch( e ) { // SyntaxError
                throw new SchemaException( e.message );
            }
        } else {
            obj = content;
        }

        let isValid: boolean;
        try {
            let validate = validator( schema, { verbose: true } );
            isValid = validate( obj );
        } catch ( e ) {
            throw new SchemaException( e.message );
        }
        if ( ! isValid ) {
            throw new SchemaException( 'JSON content does not match the given schema.' );
        }        
    }

}
