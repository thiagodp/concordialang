import { Location } from 'concordialang-types';

/**
 * Provides an exception that contains information about its location.
 *
 * @author Thiago Delgado Pinto
 */
export abstract class LocatedException extends Error {

    name = 'LocatedException';

    constructor( message?: string, public location?: Location, showFilePath: boolean = false ) {
        super( LocatedException.makeExceptionMessage( message, location, showFilePath ) );
    }

    public static makeExceptionMessage(
        originalMessage?: string,
        location?: Location,
        showFilePath: boolean = false
    ): string {
        let msg = '';
        if ( location ) {
            msg += '(' + location.line + ',' + location.column + ') ';
            if ( showFilePath && location.filePath ) {
                msg += location.filePath + ': ';
            }
        }
        msg += originalMessage || '';

        return msg;
    }

}