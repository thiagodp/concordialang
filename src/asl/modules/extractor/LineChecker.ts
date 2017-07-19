/**
 * Line checker
 */
export class LineChecker {

    public isEmpty( line: string ): boolean {
        return 0 === line.trim().length;
    }

    public startsWith( text: string, line: string ): boolean {
        return 0 === this.positionOf( text.trim(), line.trim() );
    }

    public positionOf( text: string, line: string ): number {
        return line.toLowerCase().indexOf( text.toLowerCase() );
    }

    public textAfterSeparator( separator: string, line: string ) {
        let i = line.indexOf( separator );
        return i >= 0 && i < ( line.length - 1 ) ? line.substr( i + 1 ) : '';
    }

}