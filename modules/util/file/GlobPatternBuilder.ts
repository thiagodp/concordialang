import { join } from "path";
import { toUnixPath } from "./path-transformer";
import { PatternBuilder } from "./PatternBuilder";

export class GlobPatternBuilder implements PatternBuilder {

    directory( directory: string, onlyCurrentDir: boolean ): string {
        const pattern = onlyCurrentDir ? '**' : '**/*';
        return toUnixPath( join( directory, pattern ) );
    }

    filesWithinDirectory( files: string[], directory: string, onlyCurrentDir: boolean ): string {
        const pattern = onlyCurrentDir ? join( directory, '/' ) : join( directory, '**/' );
        const dirP = toUnixPath( pattern );
        const filesP = this.files( files );
        return `${dirP}${filesP}`;
    }

    /** @inheritdoc */
    files( files: string[] ): string {
        return 1 === files.length
            ? toUnixPath( files[ 0 ] )
            : '{' + files.map( f => toUnixPath( f ) ).join( ',' ) + '}';
    }

    /** @inheritdoc */
    filesToIgnore( files: string[] ): string {
        // return '(' + files.map( f => f.replace( '\\', '/' ) ).join( '|' ) + ')';
        return '**/' + this.files( files );
    }

    /** @inheritdoc */
    extensionsWithinDirectory( extensions: string[], directory: string, onlyCurrentDir: boolean = false ): string {
        const dir = this.directory( directory, onlyCurrentDir );
        const ext =  this.extensions( extensions );
        const exp = 1 == extensions.length ? `${dir}.${ext}` : `${dir}.{${ext}}`;
        return exp;
    }

    /** @inheritdoc */
    extensions( extensions: string[] ): string {

        const removeDot = ext => ext.startsWith( '.' ) ? ext.substr( 1 ) : ext;

        return  1 == extensions.length
            ? removeDot( extensions[ 0 ] )
            : extensions.map( e => removeDot( e ) ).join( ',' );
    }

    /** @inheritdoc */
    prettyExtensions( extensions: string[] ): string[] {
        return extensions.map( e => e.indexOf( '.' ) >= 0 ? e : '.' + e );
    }

}