/**
 * Line checker
 */
export class LineChecker {

    public isEmpty( line: string ): boolean {
        return 0 === line.trim().length;
    }

    public caseInsensitivePositionOf( text: string, line: string ): number {
        return line.toLowerCase().indexOf( text.toLowerCase() );
    }

    public textAfterSeparator( separator: string, line: string ) {
        let i = line.indexOf( separator );
        return i >= 0 && i < ( line.length - 1 ) ? line.substr( i + 1 ) : '';
    }

    public textBeforeSeparator( separator: string, line: string ) {
        let i = line.indexOf( separator );
        return i > 0 ? line.substring( 0, i ) : '';
    }    

}