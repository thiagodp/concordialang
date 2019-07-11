import { LocatedException } from '../error/LocatedException';
import { Warning } from '../error/Warning';

export function sortErrorsByLocation( errors: LocatedException[] ): LocatedException[] {
    return Array.sort( errors, ( a: LocatedException, b: LocatedException ) => {
        if ( a.location && b.location ) {
            // Compare the line
            let lineDiff: number = a.location.line - b.location.line;
            if ( 0 === lineDiff ) { // Same line, so let's compare the column
                return a.location.column - b.location.column;
            }
            return lineDiff;
        }
        // No location, so let's compare the error type
        const warningName = ( new Warning() ).name;
        const aIsWarning = a.name === warningName;
        const bIsWarning = b.name === warningName;
        // Both are warnings, they are equal
        if ( aIsWarning && bIsWarning ) {
            return 0;
        }
        return aIsWarning ? 1 : -1;
    } );
}