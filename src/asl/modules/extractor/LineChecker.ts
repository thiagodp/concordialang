/**
 * Line checker
 */
export class LineChecker {

    isEmpty( line: string ): boolean {
        return 0 === line.trim().length;
    }

    startsWith( text: string, line: string ): boolean {
        return 0 === this.positionOf( text.trim(), line.trim() );
    }

    positionOf( text: string, line: string ): number {
        return line.toLowerCase().indexOf( text.toLowerCase() );
    }

    textAfterSeparator( line: string, separator: string ) {
        let i = line.indexOf( separator );
        return i >= 0 && i < ( line.length - 1 ) ? line.substr( i + 1 ) : '';
    }

}