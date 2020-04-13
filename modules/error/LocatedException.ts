import { Location } from 'concordialang-types';

/**
 * Provides an exception that contains information about its location.
 *
 * @author Thiago Delgado Pinto
 */
export abstract class LocatedException extends Error {

    name = 'LocatedException';
    isWarning: boolean = false;

    constructor(
        message?: string,
        public location?: Location,
        messageShouldIncludeFilePath: boolean = false
    ) {
        super( LocatedException.makeExceptionMessage( message, location, messageShouldIncludeFilePath ) );
    }

    public static makeExceptionMessage(
        originalMessage?: string,
        location?: Location,
        includeFilePath: boolean = false
    ): string {
        let msg = '';
        if ( location ) {
            msg += '(' + location.line + ',' + location.column + ') ';
            if ( includeFilePath && location.filePath ) {
                msg += location.filePath + ': ';
            }
        }
        msg += originalMessage || '';
        return msg;
    }

}