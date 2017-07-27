import { Location  } from "./ast/Location";

/**
 * Provides an exception that contains information about the location of an error in a line.
 */
export abstract class LocatedException extends Error {

    constructor( message?: string, public location?: Location ) {
        super( LocatedException.makeExceptionMessage( message, location ) );
    }

    public static makeExceptionMessage( originalMessage?: string, location?: Location ): string {
        return location && originalMessage
            ? '(' + location.line + ':' + location.column + '): ' + originalMessage
            : originalMessage ? originalMessage : '';
    }

}