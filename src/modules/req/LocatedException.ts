import { Location  } from "../ast/Location";

/**
 * Provides an exception that contains information about the location of an error in a line.
 * 
 * @author Thiago Delgado Pinto
 */
export abstract class LocatedException extends Error {

    constructor( message?: string, public location?: Location ) {
        super( LocatedException.makeExceptionMessage( message, location ) );
    }

    public static makeExceptionMessage( originalMessage?: string, location?: Location ): string {
        let msg = '';
        if ( location ) {
            msg += '(' + location.line + ',' + location.column + ') ';
            if ( location.filePath ) {
                msg += location.filePath + ': ';
            }
        }
        msg += originalMessage || '';

        return msg;
    }

}