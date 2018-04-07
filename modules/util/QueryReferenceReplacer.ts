import { escapeId, escape } from 'sqlstring';
import { QueryParser } from '../db/QueryParser';

/**
 * Query reference replacer
 *
 * @author Thiago Delgado Pinto
 */
export class QueryReferenceReplacer {

    replaceConstantInQuery( query: string, variable: string, value: string | number | boolean ): string {
        const regex = this.makeNameRegex( variable );
        return query.replace( regex, this.wrapValue( value ) );
    }

    replaceUIElementInQuery( query: string, variable: string, value: string | number | boolean ): string {
        const regex = this.makeVarRegex( variable );
        return query.replace( regex, this.wrapValue( value ) );
    }

    replaceDatabaseInQuery( query: string, variable: string ): string {
        const regex = this.makeNameRegex( variable );
        return query.replace( regex, '' ); // just removes the database reference
    }

    replaceTableInQuery( query: string, variable: string ): string {
        const regex = this.makeNameRegex( variable );
        return query.replace( regex, '' ); // just removes the database reference
    }

    wrapValue( content: string | number | boolean ): string {
        return escape( content );
    }

    // private wrapName( content: string ): string {
    //     return escapeId( content );
    // }

    private makeVarRegex( name: string ): RegExp {
        return ( new QueryParser() ).makeVariableRegex( name );
    }

    private makeNameRegex( name: string ): RegExp {
        return ( new QueryParser() ).makeNameRegex( name );
    }

}