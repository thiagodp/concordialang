import { Location  } from "../ast/Location";

export class LocatedException extends Error {

    constructor( message?: string, private location?: Location ) {
        super( LocatedException.makeExceptionMessage( message ) );
    }

    public getLocation(): Location {
        return this.location;
    }

    public static makeExceptionMessage( originalMessage?: string, location?: Location ): string {
        return location && originalMessage
            ? '(' + location.line + ':' + location.column + '): ' + originalMessage
            : originalMessage ? originalMessage : '';
    }

}