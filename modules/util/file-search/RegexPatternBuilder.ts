import { PatternBuilder } from "./PatternBuilder";

/** Use them with new RegExp( exp, 'ui' ) */
export class RegexPatternBuilder implements PatternBuilder {

    files( files: string[] ): string {
        const exp = '(' + files.map( f => f.replace( '/', '\\\\' ) ).join( '|' ) + ')';
        return exp;
    }

    filesToIgnore( files: string[] ): string {
        const exp = '(' + files.map( f => f.replace( '\\', '/' ) ).join( '|' ) + ')';
        return exp;
    }

    extensionsWithinDirectory( extensions: string[], directory: string, onlyCurrentDir: boolean = false ): string {
        throw new Error( 'not implemented yet' );
    }

    extensions( extensions: string[] ): string {
        const exp = '(' + extensions.map( e => e.indexOf( '.' ) >= 0 ? '\\' + e : '\\.' + e ).join( '|' ) + ')$';
        return exp;
    }

    prettyExtensions( extensions: string[] ): string[] {
        return extensions.map( e => e.indexOf( '.' ) >= 0 ? e : '.' + e );
    }

}