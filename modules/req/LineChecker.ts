/**
 * Line checker
 * 
 * @author Thiago Delgado Pinto
 */
export class LineChecker {

    public isEmpty( line: string ): boolean {
        return 0 === line.trim().length;
    }

    public countLeftSpacesAndTabs( line: string ): number {
        let i = 0, len = line.length, found = true, ch;
        while ( i < len && found ) {
            ch = line.charAt( i++ );
            found = ( ' ' == ch || "\t" == ch );
        }
        return i - 1;
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